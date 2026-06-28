param(
    [string]$ReportPath = "_docs/_reports/hosted-ci-latest.md",
    [string]$RunUrl = "",
    [string]$RunId = "",
    [string]$CommitSha = "",
    [string]$RemoteName = "origin",
    [string]$Repository = "zenweb/AIMes",
    [string]$Branch = "V1",
    [string]$Evidence = ""
)

$ErrorActionPreference = "Stop"
$failResultToken = "Result: FAIL"

function Add-Line([string]$Line = "") {
    $script:reportLines += $Line
}

function Test-HasValue([string]$Value) {
    return -not [string]::IsNullOrWhiteSpace($Value)
}

function Test-RealEvidence([string]$Value) {
    $placeholderEvidenceMessage = "Evidence cannot be a placeholder"

    if (-not (Test-HasValue $Value)) {
        return $false
    }

    $trimmed = $Value.Trim()
    $tail = if ($trimmed.Contains(":")) { $trimmed.Substring($trimmed.LastIndexOf(":") + 1).Trim() } else { $trimmed }
    $placeholders = @("TBD", "TODO", "PENDING", "待补", "待定")
    return -not ($placeholders | Where-Object {
        [string]::Equals($trimmed, $_, [StringComparison]::OrdinalIgnoreCase) -or
            [string]::Equals($tail, $_, [StringComparison]::OrdinalIgnoreCase)
    } | Select-Object -First 1)
}

function Test-GitHubActionsRunUrl([string]$Value) {
    return (Test-HasValue $Value) -and ($Value -match '^https://github.com/.+/actions/runs/\d+$')
}

function Test-NumericRunId([string]$Value) {
    return (Test-HasValue $Value) -and ($Value -match '^\d+$')
}

function Test-GitHubActionsRunUrlMatchesRunId([string]$RunUrlValue, [string]$RunIdValue) {
    return (Test-GitHubActionsRunUrl $RunUrlValue) `
        -and (Test-NumericRunId $RunIdValue) `
        -and ($RunUrlValue -match '/actions/runs/(\d+)$') `
        -and [string]::Equals($matches[1], $RunIdValue, [StringComparison]::Ordinal)
}

function Test-TextContainsNumberToken([string[]]$Lines, [string]$ExpectedNumber) {
    if ([string]::IsNullOrWhiteSpace($ExpectedNumber)) {
        return $false
    }

    $text = [string]::Join("`n", $Lines)
    $escapedExpectedNumber = [regex]::Escape($ExpectedNumber)
    return $text -match "(?<!\d)$escapedExpectedNumber(?!\d)"
}

function Invoke-Capture([scriptblock]$Command) {
    try {
        $output = & $Command 2>&1
        $exitCode = if ($null -eq $LASTEXITCODE) { 0 } else { $LASTEXITCODE }
    } catch {
        $output = @($_.Exception.Message)
        $exitCode = 1
    }

    return [pscustomobject]@{
        ExitCode = $exitCode
        Output = @($output | ForEach-Object { [string]$_ })
    }
}

$reportDirectory = Split-Path -Parent $ReportPath
if (-not [string]::IsNullOrWhiteSpace($reportDirectory)) {
    New-Item -ItemType Directory -Force -Path $reportDirectory | Out-Null
}

$ciWorkflowPath = ".github/workflows/ci.yml"
$evalWorkflowPath = ".github/workflows/eval.yml"
$violations = New-Object System.Collections.Generic.List[string]

if (-not (Test-Path $ciWorkflowPath)) {
    $violations.Add("Repository-root .github/workflows/ci.yml is missing.")
}

if (-not (Test-Path $evalWorkflowPath)) {
    $violations.Add("Repository-root .github/workflows/eval.yml is missing.")
}

if (-not (Test-HasValue $RunUrl)) {
    $violations.Add("RunUrl is required to close the hosted CI release gate.")
} elseif (-not (Test-GitHubActionsRunUrl $RunUrl)) {
    $violations.Add("RunUrl must be a GitHub Actions run URL matching github.com/.+/actions/runs/.")
}

if (-not (Test-HasValue $RunId)) {
    $violations.Add("RunId is required to close the hosted CI release gate.")
} elseif (-not (Test-NumericRunId $RunId)) {
    $violations.Add("RunId must be numeric.")
}

if ((Test-GitHubActionsRunUrl $RunUrl) -and (Test-NumericRunId $RunId) -and -not (Test-GitHubActionsRunUrlMatchesRunId $RunUrl $RunId)) {
    $violations.Add("RunUrl run id must match RunId.")
}

if (-not (Test-RealEvidence $Evidence)) {
    $violations.Add("Hosted CI job summary evidence is required to close the hosted CI release gate. Evidence cannot be a placeholder.")
}

if (-not (Test-HasValue $CommitSha)) {
    $violations.Add("CommitSha is required to close the hosted CI release gate.")
}

$gitRemote = Invoke-Capture { git ls-remote --heads $RemoteName }
$ghRun = Invoke-Capture { gh run list --limit 5 }
$ghRunView = if (Test-NumericRunId $RunId) {
    Invoke-Capture { gh run view $RunId --json conclusion,status,url,workflowName,headBranch,headSha }
} else {
    [pscustomobject]@{
        ExitCode = 1
        Output = @("RunId is required before gh run view can verify hosted CI conclusion.")
    }
}

if ($ghRun.ExitCode -ne 0) {
    $violations.Add("gh run list must succeed in the authorized hosted CI evidence environment.")
}

if ($ghRun.ExitCode -eq 0 -and (Test-NumericRunId $RunId) -and -not (Test-TextContainsNumberToken $ghRun.Output $RunId)) {
    $violations.Add("gh run list output must include RunId.")
}

if ($ghRunView.ExitCode -ne 0) {
    $violations.Add("gh run view must succeed for RunId.")
} else {
    $ghRunViewText = [string]::Join("`n", $ghRunView.Output)
    if (-not ($ghRunViewText.Contains('"status":"completed"') -and $ghRunViewText.Contains('"conclusion":"success"'))) {
        $violations.Add("Hosted CI run must be completed with conclusion success.")
    }

    if ((Test-HasValue $Repository) -and (Test-GitHubActionsRunUrl $RunUrl) -and -not $RunUrl.StartsWith("https://github.com/$Repository/actions/runs/", [StringComparison]::OrdinalIgnoreCase)) {
        $violations.Add("Hosted CI run must be for the release repository.")
    }

    if ((Test-HasValue $Branch) -and -not $ghRunViewText.Contains('"headBranch":"' + $Branch + '"')) {
        $violations.Add("Hosted CI run must be for the V1 release branch.")
    }

    if ((Test-HasValue $CommitSha) -and -not $ghRunViewText.Contains('"headSha":"' + $CommitSha + '"')) {
        $violations.Add("Hosted CI run headSha must match CommitSha.")
    }
}

$status = if ($violations.Count -eq 0) { "READY_FOR_RELEASE_REVIEW" } else { "MISSING_REMOTE_RUN" }
$result = if ($violations.Count -eq 0) { "PASS" } else { "FAIL" }

$script:reportLines = @()
Add-Line "# Hosted CI evidence"
Add-Line ""
Add-Line "- GeneratedAt: $(Get-Date -Format o)"
Add-Line "- Status: $status"
Add-Line "- RemoteName: $RemoteName"
Add-Line "- Repository: $Repository"
Add-Line "- Branch: $Branch"
Add-Line "- CommitSha: $CommitSha"
Add-Line "- HeadSha: $CommitSha"
Add-Line "- RunUrl: $RunUrl"
Add-Line "- RunId: $RunId"
Add-Line "- Evidence: $Evidence"
Add-Line ""
Add-Line "## Local workflow files"
Add-Line ""
Add-Line "- .github/workflows/ci.yml: $(Test-Path $ciWorkflowPath)"
Add-Line "- .github/workflows/eval.yml: $(Test-Path $evalWorkflowPath)"
Add-Line ""
Add-Line "## git ls-remote"
Add-Line ""
Add-Line '```text'
Add-Line "Exit code: $($gitRemote.ExitCode)"
foreach ($line in $gitRemote.Output) {
    Add-Line $line
}
Add-Line '```'
Add-Line ""
Add-Line "## gh run"
Add-Line ""
Add-Line '```text'
Add-Line "Exit code: $($ghRun.ExitCode)"
foreach ($line in $ghRun.Output) {
    Add-Line $line
}
Add-Line '```'
Add-Line ""
Add-Line "## gh run view"
Add-Line ""
Add-Line '```text'
Add-Line "Exit code: $($ghRunView.ExitCode)"
foreach ($line in $ghRunView.Output) {
    Add-Line $line
}
Add-Line '```'
Add-Line ""
Add-Line "## Gate"
Add-Line ""
Add-Line "- Required evidence: hosted runner RunUrl, RunId, release repository, release branch, head SHA, and job summary."
Add-Line "- Result: $result"

if ($violations.Count -gt 0) {
    Add-Line ""
    Add-Line "## Violations"
    Add-Line ""
    foreach ($violation in $violations) {
        Add-Line "- $violation"
    }
    Add-Line ""
    Add-Line "This report cannot close the hosted CI release gate."
}

Set-Content -Path $ReportPath -Value $script:reportLines -Encoding UTF8
Write-Host "Hosted CI evidence report: $ReportPath"

if ($result -ne "PASS") {
    throw "Hosted CI evidence gate failed. See $ReportPath."
}
