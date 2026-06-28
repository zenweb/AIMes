param(
    [string]$ReportPath = "_docs/_reports/github-v1-push-readiness-latest.md",
    [string]$Repository = "zenweb/AIMes",
    [string]$Branch = "V1",
    [string]$SshKeyPath = "$env:USERPROFILE\.ssh\aa"
)

$ErrorActionPreference = "Stop"

function Add-Line([string]$Line = "") {
    $script:reportLines += $Line
}

function Invoke-Check([string]$Name, [scriptblock]$Command) {
    $output = @()
    $exitCode = 0
    try {
        $output = & $Command 2>&1
        $exitCode = if ($null -eq $LASTEXITCODE) { 0 } else { $LASTEXITCODE }
    } catch {
        $output = @($_.Exception.Message)
        $exitCode = 1
    }

    [pscustomobject]@{
        Name     = $Name
        ExitCode = $exitCode
        Output   = @($output | ForEach-Object { [string]$_ })
    }
}

function Get-FirstOutputLine([object]$Check) {
    return ($Check.Output | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | Select-Object -First 1)
}

function Get-JsonValue([object]$Check, [string]$Property) {
    try {
        $text = ($Check.Output -join "`n").Trim()
        if ([string]::IsNullOrWhiteSpace($text)) {
            return ""
        }
        $json = $text | ConvertFrom-Json
        return [string]$json.$Property
    } catch {
        return ""
    }
}

$reportDirectory = Split-Path -Parent $ReportPath
if (-not [string]::IsNullOrWhiteSpace($reportDirectory)) {
    New-Item -ItemType Directory -Force -Path $reportDirectory | Out-Null
}

$generatedAt = Get-Date -Format o
$localHead = (git rev-parse HEAD).Trim()
$sshKeyExists = Test-Path $SshKeyPath
$sshKeyFingerprint = ""
if ($sshKeyExists) {
    $fingerprintCheck = Invoke-Check "SSH key fingerprint" { ssh-keygen -lf $SshKeyPath }
    $sshKeyFingerprint = Get-FirstOutputLine $fingerprintCheck
}

$checks = @()
$checks += Invoke-Check "gh auth status" { gh auth status }
$checks += Invoke-Check "GitHub repository view" { gh repo view $Repository --json nameWithOwner,defaultBranchRef }
$checks += Invoke-Check "GitHub branch ref via API" { gh api "repos/$Repository/git/ref/heads/$Branch" --jq .object.sha }
$checks += Invoke-Check "GitHub CI runs on branch" { gh run list --repo $Repository --workflow CI --branch $Branch --limit 5 --json databaseId,status,conclusion,headBranch,headSha,url,workflowName,createdAt }
$checks += Invoke-Check "GitHub Agent Evaluation runs on branch" { gh run list --repo $Repository --workflow "Agent Evaluation" --branch $Branch --limit 5 --json databaseId,status,conclusion,headBranch,headSha,url,workflowName,createdAt }
$checks += Invoke-Check "git HTTPS ls-remote" { git ls-remote "https://github.com/$Repository.git" "refs/heads/$Branch" }

$sshKeyForCommand = $SshKeyPath.Replace("\", "/")
$checks += Invoke-Check "SSH auth with configured key" { ssh -i $sshKeyForCommand -o IdentitiesOnly=yes -T git@github.com }

$githubBranchSha = Get-FirstOutputLine ($checks | Where-Object { $_.Name -eq "GitHub branch ref via API" } | Select-Object -First 1)
$ciRunsText = (($checks | Where-Object { $_.Name -eq "GitHub CI runs on branch" } | Select-Object -First 1).Output -join "`n").Trim()
$evalRunsText = (($checks | Where-Object { $_.Name -eq "GitHub Agent Evaluation runs on branch" } | Select-Object -First 1).Output -join "`n").Trim()

$hasCiRun = -not [string]::Equals($ciRunsText, "[]", [StringComparison]::Ordinal)
$hasEvalRun = -not [string]::Equals($evalRunsText, "[]", [StringComparison]::Ordinal)
$ciRunSuccess = $hasCiRun -and $ciRunsText.Contains('"status":"completed"') -and $ciRunsText.Contains('"conclusion":"success"') -and $ciRunsText.Contains($localHead)
$evalRunSuccess = $hasEvalRun -and $evalRunsText.Contains('"status":"completed"') -and $evalRunsText.Contains('"conclusion":"success"') -and $evalRunsText.Contains($localHead)
$httpsReachable = (($checks | Where-Object { $_.Name -eq "git HTTPS ls-remote" } | Select-Object -First 1).ExitCode -eq 0)
$sshAccepted = (($checks | Where-Object { $_.Name -eq "SSH auth with configured key" } | Select-Object -First 1).Output -join "`n") -match "successfully authenticated"
$remoteMatchesLocal = [string]::Equals($githubBranchSha, $localHead, [StringComparison]::OrdinalIgnoreCase)

$violations = New-Object System.Collections.Generic.List[string]
if (-not $remoteMatchesLocal) {
    $violations.Add("GitHub $Branch does not match local HEAD.")
}
if (-not $ciRunSuccess) {
    $violations.Add("GitHub $Branch has no successful completed CI run for local HEAD.")
}
if (-not $evalRunSuccess) {
    $violations.Add("GitHub $Branch has no successful completed Agent Evaluation run for local HEAD.")
}

$result = if ($violations.Count -eq 0) { "PASS" } else { "FAIL" }

$script:reportLines = @()
Add-Line "# GitHub V1 push readiness"
Add-Line ""
Add-Line "- GeneratedAt: $generatedAt"
Add-Line "- Repository: $Repository"
Add-Line "- Branch: $Branch"
Add-Line "- LocalHead: $localHead"
Add-Line "- GitHubBranchHead: $githubBranchSha"
Add-Line "- SshKeyPath: $SshKeyPath"
Add-Line "- SshKeyExists: $sshKeyExists"
if (-not [string]::IsNullOrWhiteSpace($sshKeyFingerprint)) {
    Add-Line "- SshKeyFingerprint: $sshKeyFingerprint"
}
Add-Line ""
Add-Line "## Summary"
Add-Line ""
Add-Line "| Check | Status |"
Add-Line "| --- | --- |"
Add-Line "| GitHub branch matches local HEAD | $(if ($remoteMatchesLocal) { "PASS" } else { "FAIL" }) |"
Add-Line "| GitHub CI run succeeded for local HEAD | $(if ($ciRunSuccess) { "PASS" } else { "FAIL" }) |"
Add-Line "| GitHub Agent Evaluation run succeeded for local HEAD | $(if ($evalRunSuccess) { "PASS" } else { "FAIL" }) |"
Add-Line "| HTTPS transport reachable | $(if ($httpsReachable) { "PASS" } else { "FAIL" }) |"
Add-Line "| SSH key accepted | $(if ($sshAccepted) { "PASS" } else { "FAIL" }) |"
Add-Line ""
Add-Line "## Command Evidence"
foreach ($check in $checks) {
    Add-Line ""
    Add-Line "### $($check.Name)"
    Add-Line ""
    Add-Line "- ExitCode: $($check.ExitCode)"
    Add-Line ""
    Add-Line '```text'
    if ($check.Output.Count -eq 0) {
        Add-Line "no output"
    } else {
        foreach ($line in $check.Output) {
            Add-Line $line
        }
    }
    Add-Line '```'
}
Add-Line ""
Add-Line "## Gate"
Add-Line ""
Add-Line "- Result: $result"

if ($violations.Count -gt 0) {
    Add-Line ""
    Add-Line "## Violations"
    Add-Line ""
    foreach ($violation in $violations) {
        Add-Line "- $violation"
    }
    Add-Line ""
    Add-Line "This check cannot close hosted CI evidence. Fix the violations, then push $Branch and wait for hosted workflows."
} elseif (-not ($httpsReachable -or $sshAccepted)) {
    Add-Line ""
    Add-Line "## Transport Note"
    Add-Line ""
    Add-Line "- Hosted CI evidence is complete for the current branch/head."
    Add-Line "- Current Git transport check did not prove a reusable push channel. Future pushes may still require HTTPS connectivity or an accepted SSH key."
}

Set-Content -Path $ReportPath -Value $script:reportLines -Encoding UTF8
Write-Host "GitHub V1 push readiness report: $ReportPath"

if ($result -ne "PASS") {
    throw "GitHub V1 push readiness failed. See $ReportPath."
}
