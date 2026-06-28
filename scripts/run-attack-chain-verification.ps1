param(
    [string]$ReportPath = "_docs/_reports/attack-chain-verification-latest.md",
    [string]$Verifier = "",
    [string]$VerifiedAt = "",
    [ValidateSet("PENDING", "PASS")]
    [string]$AttackChainA = "PENDING",
    [ValidateSet("PENDING", "PASS")]
    [string]$AttackChainB = "PENDING",
    [ValidateSet("PENDING", "PASS")]
    [string]$AttackChainC = "PENDING",
    [string]$AttackChainAEvidence = "",
    [string]$AttackChainBEvidence = "",
    [string]$AttackChainCEvidence = "",
    [string]$Notes = ""
)

$ErrorActionPreference = "Stop"
$failResultToken = "Result: FAIL"
$script:repositoryRoot = Split-Path -Parent $PSScriptRoot

function Add-Line([string]$Line = "") {
    $script:reportLines += $Line
}

function Test-HasValue([string]$Value) {
    return -not [string]::IsNullOrWhiteSpace($Value)
}

function Test-RealEvidence([string]$Value) {
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

function Test-EvidenceReferenceExists([string]$Value) {
    if (-not (Test-HasValue $Value)) {
        return $false
    }

    # Repo-local evidence references are accepted under _docs/ and output/.
    $evidenceMatches = @($Value | Select-String -AllMatches -Pattern '(?:_docs|output)/[A-Za-z0-9._/-]+\.(?:md|png|jpg|jpeg|webp|json|txt|log|zip|html|pdf|csv)' | ForEach-Object { $_.Matches } | ForEach-Object { $_ })
    if ($evidenceMatches.Count -eq 0) {
        return $true
    }

    foreach ($evidenceMatch in $evidenceMatches) {
        $evidencePath = $evidenceMatch.Value.TrimEnd(',', ';', '.', ':', ')', ']')
        $relativePath = $evidencePath.Replace('/', [System.IO.Path]::DirectorySeparatorChar)
        $candidate = Join-Path $script:repositoryRoot $relativePath
        if (-not (Test-Path $candidate)) {
            return $false
        }
    }

    return $true
}

$reportDirectory = Split-Path -Parent $ReportPath
if (-not [string]::IsNullOrWhiteSpace($reportDirectory)) {
    New-Item -ItemType Directory -Force -Path $reportDirectory | Out-Null
}

$violations = New-Object System.Collections.Generic.List[string]

if (-not (Test-RealEvidence $Verifier)) {
    $violations.Add("Verifier is required for manual verification. Verifier cannot be a placeholder.")
}

if (-not (Test-HasValue $VerifiedAt)) {
    $violations.Add("VerifiedAt is required for manual verification.")
} else {
    try {
        $verifiedAtTimestamp = [DateTimeOffset]::Parse($VerifiedAt)
        if ($verifiedAtTimestamp -gt [DateTimeOffset]::UtcNow) {
            $violations.Add("VerifiedAt must not be in the future.")
        }
    } catch {
        $violations.Add("VerifiedAt must be a parseable timestamp for manual verification.")
    }
}

if ($AttackChainA -ne "PASS") {
    $violations.Add("Attack Chain A manual verification is not PASS.")
}

if ($AttackChainB -ne "PASS") {
    $violations.Add("Attack Chain B manual verification is not PASS.")
}

if ($AttackChainC -ne "PASS") {
    $violations.Add("Attack Chain C manual verification is not PASS.")
}

if (-not (Test-RealEvidence $AttackChainAEvidence)) {
    $violations.Add("Attack Chain A evidence is required. Evidence cannot be a placeholder.")
} elseif (-not (Test-EvidenceReferenceExists $AttackChainAEvidence)) {
    $violations.Add("Attack Chain A evidence reference does not exist. Evidence reference does not exist.")
}

if (-not (Test-RealEvidence $AttackChainBEvidence)) {
    $violations.Add("Attack Chain B evidence is required. Evidence cannot be a placeholder.")
} elseif (-not (Test-EvidenceReferenceExists $AttackChainBEvidence)) {
    $violations.Add("Attack Chain B evidence reference does not exist. Evidence reference does not exist.")
}

if (-not (Test-RealEvidence $AttackChainCEvidence)) {
    $violations.Add("Attack Chain C evidence is required. Evidence cannot be a placeholder.")
} elseif (-not (Test-EvidenceReferenceExists $AttackChainCEvidence)) {
    $violations.Add("Attack Chain C evidence reference does not exist. Evidence reference does not exist.")
}

$status = if ($violations.Count -eq 0) { "VERIFIED" } else { "PENDING_MANUAL_VERIFICATION" }
$result = if ($violations.Count -eq 0) { "PASS" } else { "FAIL" }

$script:reportLines = @()
Add-Line "# Manual verification for Attack Chain A/B/C"
Add-Line ""
Add-Line "- GeneratedAt: $(Get-Date -Format o)"
Add-Line "- Status: $status"
Add-Line "- Verifier: $Verifier"
Add-Line "- VerifiedAt: $VerifiedAt"
Add-Line "- Notes: $Notes"
Add-Line ""
Add-Line "## Attack Chain A"
Add-Line ""
Add-Line "- Scenario: unauthorized or low-privilege access to authenticated APIs/admin/agent actions."
Add-Line "- Manual verification: $AttackChainA"
Add-Line "- Evidence: $AttackChainAEvidence"
Add-Line ""
Add-Line "## Attack Chain B"
Add-Line ""
Add-Line "- Scenario: credential, token, log, audit, frontend state, or export leakage."
Add-Line "- Manual verification: $AttackChainB"
Add-Line "- Evidence: $AttackChainBEvidence"
Add-Line ""
Add-Line "## Attack Chain C"
Add-Line ""
Add-Line "- Scenario: unsafe release configuration, weak CORS, missing dependencies, or vulnerable package promotion."
Add-Line "- Manual verification: $AttackChainC"
Add-Line "- Evidence: $AttackChainCEvidence"
Add-Line ""
Add-Line "## Gate"
Add-Line ""
Add-Line "- Manual verification is required before the human signer can close the security signoff release gate."
Add-Line "- Result: $result"

if ($violations.Count -gt 0) {
    Add-Line ""
    Add-Line "## Violations"
    Add-Line ""
    foreach ($violation in $violations) {
        Add-Line "- $violation"
    }
    Add-Line ""
    Add-Line "This report cannot close the security signoff release gate."
}

Set-Content -Path $ReportPath -Value $script:reportLines -Encoding UTF8
Write-Host "Attack-chain verification report: $ReportPath"

if ($result -ne "PASS") {
    throw "Attack-chain manual verification gate failed. See $ReportPath."
}
