param(
    [string]$ReportPath = "_docs/_review/security-signoff-latest.md",
    [ValidateSet("UNSIGNED", "SIGNED")]
    [string]$Status = "UNSIGNED",
    [string]$Signer = "",
    [string]$SignedAt = "",
    [string]$Evidence = "",
    [string]$Notes = "",
    [string]$HostedCiReportPath = "_docs/_reports/hosted-ci-20260611-v1-pass.md",
    [string]$StagingReportPath = "_docs/_reports/staging-rehearsal-20260611-docker-restored.md",
    [string]$SecuritySelfAssessmentPath = "_docs/_reports/security-self-assessment-20260611-current.md",
    [string]$AttackChainAutomatedPath = "_docs/_reports/attack-chain-automated-evidence-20260611-current.md",
    [string]$AttackChainReportPath = "_docs/_reports/attack-chain-verification-20260611-manual-pending.md",
    [string]$AttackChainHumanReviewPacketPath = "_docs/_reports/attack-chain-human-review-packet-20260611.md",
    [string]$FrontendEvidencePath = "_docs/_reports/frontend-real-browser-evidence-20260611.md"
)

$ErrorActionPreference = "Stop"

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
    $placeholders = @("TBD", "TODO", "PENDING", "UNSIGNED", "FAIL", "待补", "待定")
    return -not ($placeholders | Where-Object {
        [string]::Equals($trimmed, $_, [StringComparison]::OrdinalIgnoreCase) -or
            [string]::Equals($tail, $_, [StringComparison]::OrdinalIgnoreCase)
    } | Select-Object -First 1)
}

function Read-TextOrEmpty([string]$Path) {
    if (-not (Test-Path $Path)) {
        return ""
    }

    return Get-Content -Raw -Path $Path
}

function Test-AnchoredReportPass([string]$Text) {
    $lines = $Text -split "`r?`n"
    return ($lines | Where-Object {
        $_ -match '^- Result: PASS\s*$' -or $_ -match '^Result: PASS\s*$'
    } | Select-Object -First 1) -ne $null
}

function Test-EvidenceReportPass([string]$Path) {
    if (-not (Test-Path $Path)) {
        return $false
    }

    return Test-AnchoredReportPass (Read-TextOrEmpty $Path)
}

function Test-RequiredEvidenceReport(
    [string]$Path,
    [string]$Violation
) {
    if (-not (Test-EvidenceReportPass $Path)) {
        $script:violations.Add($Violation)
    }
}

function Get-AnchoredLineValues([string[]]$Lines, [string]$Label) {
    $escapedLabel = [regex]::Escape($Label)
    return @($Lines | ForEach-Object {
        if ($_ -match "^- $escapedLabel\s*:\s*(.+?)\s*$" -or $_ -match "^$escapedLabel\s*:\s*(.+?)\s*$") {
            $matches[1]
        }
    })
}

function Test-AnchoredLiteralLine([string[]]$Lines, [string]$Text) {
    $escapedText = [regex]::Escape($Text)
    return ($Lines | Where-Object {
        $_ -match "^- $escapedText\s*$" -or $_ -match "^$escapedText\s*$"
    } | Select-Object -First 1) -ne $null
}

function Test-AttackChainSectionPass([string]$Text, [string]$ChainName) {
    $escapedChainName = [regex]::Escape($ChainName)
    $pattern = "(?s)## $escapedChainName\s+(.+?)(?:\r?\n## |\z)"
    $match = [regex]::Match($Text, $pattern)

    if (-not $match.Success) {
        return $false
    }

    $section = $match.Groups[1].Value
    $sectionLines = $section -split "`r?`n"
    $hasManualPass = Test-AnchoredLiteralLine $sectionLines "Manual verification: PASS"
    $hasEvidence = (Get-AnchoredLineValues $sectionLines "Evidence" | Where-Object { Test-RealEvidence $_ } | Select-Object -First 1) -ne $null
    return $hasManualPass -and $hasEvidence
}

function Test-AttackChainVerified([string]$Text) {
    $lines = $Text -split "`r?`n"
    $hasVerifiedStatus = Test-AnchoredLiteralLine $lines "Status: VERIFIED"
    $hasVerifier = (Get-AnchoredLineValues $lines "Verifier" | Where-Object { Test-RealEvidence $_ } | Select-Object -First 1) -ne $null
    $verifiedAt = Get-AnchoredLineValues $lines "VerifiedAt" | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | Select-Object -First 1
    $hasValidVerifiedAt = $false

    if (-not [string]::IsNullOrWhiteSpace($verifiedAt)) {
        try {
            $verifiedAtTimestamp = [DateTimeOffset]::Parse($verifiedAt)
            $hasValidVerifiedAt = $verifiedAtTimestamp -le [DateTimeOffset]::UtcNow
        } catch {
            $hasValidVerifiedAt = $false
        }
    }

    return (Test-AnchoredReportPass $Text) `
        -and $hasVerifiedStatus `
        -and $hasVerifier `
        -and $hasValidVerifiedAt `
        -and (Test-AttackChainSectionPass $Text "Attack Chain A") `
        -and (Test-AttackChainSectionPass $Text "Attack Chain B") `
        -and (Test-AttackChainSectionPass $Text "Attack Chain C")
}

$reportDirectory = Split-Path -Parent $ReportPath
if (-not [string]::IsNullOrWhiteSpace($reportDirectory)) {
    New-Item -ItemType Directory -Force -Path $reportDirectory | Out-Null
}

$violations = New-Object System.Collections.Generic.List[string]
$attackChainText = Read-TextOrEmpty $AttackChainReportPath
$hostedCiEvidenceResult = if (Test-EvidenceReportPass $HostedCiReportPath) { "PASS" } else { "FAIL" }
$stagingEvidenceResult = if (Test-EvidenceReportPass $StagingReportPath) { "PASS" } else { "FAIL" }
$securitySelfAssessmentResult = if (Test-EvidenceReportPass $SecuritySelfAssessmentPath) { "PASS" } else { "FAIL" }
$attackChainAutomatedResult = if (Test-EvidenceReportPass $AttackChainAutomatedPath) { "PASS" } else { "FAIL" }
$frontendEvidenceResult = if (Test-EvidenceReportPass $FrontendEvidencePath) { "PASS" } else { "FAIL" }

if ($Status -ne "SIGNED") {
    $violations.Add("Security signoff is not SIGNED.")
}

if ($Status -eq "SIGNED") {
    Test-RequiredEvidenceReport `
        $HostedCiReportPath `
        "Hosted CI evidence must exist and be PASS before security signoff."
    Test-RequiredEvidenceReport `
        $StagingReportPath `
        "PostgreSQL/staging evidence must exist and be PASS before security signoff."
    Test-RequiredEvidenceReport `
        $SecuritySelfAssessmentPath `
        "Security self-assessment evidence must exist and be PASS before security signoff."
    Test-RequiredEvidenceReport `
        $AttackChainAutomatedPath `
        "Attack Chain automated support evidence must exist and be PASS before security signoff."
    Test-RequiredEvidenceReport `
        $FrontendEvidencePath `
        "Real Chrome frontend evidence must exist and be PASS before security signoff."

    if (-not (Test-RealEvidence $Signer)) {
        $violations.Add("Signer is required for security signoff.")
    }

    if (-not (Test-HasValue $SignedAt)) {
        $violations.Add("SignedAt is required for security signoff.")
    } else {
        try {
            $signedAtTimestamp = [DateTimeOffset]::Parse($SignedAt)
            if ($signedAtTimestamp -gt [DateTimeOffset]::UtcNow) {
                $violations.Add("SignedAt must not be in the future.")
            }
        } catch {
            $violations.Add("SignedAt must be a parseable timestamp for security signoff.")
        }
    }

    if (-not (Test-RealEvidence $Evidence)) {
        $violations.Add("Evidence is required for security signoff. Evidence cannot be a placeholder.")
    }

    if (-not (Test-AttackChainVerified $attackChainText)) {
        $violations.Add("Attack Chain A/B/C must be VERIFIED and PASS before security signoff.")
    }
}

$decision = if ($violations.Count -eq 0) { "SIGNED" } else { "UNSIGNED" }
$result = if ($violations.Count -eq 0) { "PASS" } else { "FAIL" }

$script:reportLines = @()
Add-Line "# 2026-06-11 Security Signoff Packet"
Add-Line ""
Add-Line "- Status: $decision"
Add-Line ""
Add-Line "## Scope"
Add-Line ""
Add-Line "- Release gate: v1.0.0 security signoff."
Add-Line "- Evidence: 2026-06-11 automated self-assessment, Attack Chain automated support evidence, staging probes, real Chrome frontend evidence, hosted CI, and Attack Chain A/B/C verification."
Add-Line "- Manual verification required: this packet cannot close the security signoff release gate without a human signer and verified Attack Chain A/B/C evidence."
Add-Line ""
Add-Line "## Automated Self-Assessment"
Add-Line ""
Add-Line "- Latest automated self-assessment: $SecuritySelfAssessmentPath."
Add-Line "- Attack Chain automated support evidence: $AttackChainAutomatedPath."
Add-Line "- Attack Chain human review packet: $AttackChainHumanReviewPacketPath."
Add-Line "- Real Chrome frontend evidence: $FrontendEvidencePath."
Add-Line "- Hosted CI evidence: $HostedCiReportPath."
Add-Line "- PostgreSQL/staging evidence: $StagingReportPath."
Add-Line "- Security self-assessment result: $securitySelfAssessmentResult."
Add-Line "- Attack Chain automated support result: $attackChainAutomatedResult."
Add-Line "- Real Chrome frontend evidence result: $frontendEvidenceResult."
Add-Line "- Hosted CI evidence result: $hostedCiEvidenceResult."
Add-Line "- PostgreSQL/staging evidence result: $stagingEvidenceResult."
Add-Line ""
Add-Line "## Attack Chain A/B/C"
Add-Line ""
Add-Line "- Verification report: $AttackChainReportPath."
Add-Line "- Required before signoff: verifier, verified timestamp, and dated evidence for Attack Chain A, B, and C."
Add-Line "- Current result: $(if (Test-AttackChainVerified $attackChainText) { "`PASS`" } else { "`FAIL`" })."
Add-Line ""
Add-Line "## B-Track Release Gate Cross-Check"
Add-Line ""
Add-Line "- Hosted CI: $hostedCiEvidenceResult; latest hosted evidence is $HostedCiReportPath."
Add-Line "- PostgreSQL/staging: $stagingEvidenceResult; latest real rehearsal evidence is $StagingReportPath."
Add-Line "- Attack Chain A/B/C: $(if (Test-AttackChainVerified $attackChainText) { "PASS" } else { "FAIL" })."
Add-Line "- Gray observation: FAIL until first gray release and 14-day P0/P1=0 evidence are recorded."
Add-Line ""
Add-Line "## Signoff"
Add-Line ""
Add-Line "- Signer: $Signer"
Add-Line "- SignedAt: $SignedAt"
Add-Line "- Decision: $decision"
Add-Line "- Evidence: $Evidence"
Add-Line "- Notes: $Notes"
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
    Add-Line "This report cannot close the security signoff release gate."
}

Set-Content -Path $ReportPath -Value $script:reportLines -Encoding UTF8
Write-Host "Security signoff report: $ReportPath"

if ($result -ne "PASS") {
    throw "Security signoff gate failed. See $ReportPath."
}
