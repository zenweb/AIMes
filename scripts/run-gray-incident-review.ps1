param(
    [string]$ReportPath = "_docs/_reports/gray-incident-review-latest.md",
    [ValidateSet("DRAFT", "REVIEWED", "PASS")]
    [string]$Status = "DRAFT",
    [string]$Reviewer = "",
    [string]$ReviewedAt = "",
    [string]$MonitoringSource = "",
    [string]$ObservationStartedAt = "",
    [string]$ObservationEndedAt = "",
    [int]$P0IncidentCount = -1,
    [int]$P1IncidentCount = -1,
    [string]$IncidentQueryEvidence = "",
    [string]$GrayReleaseId = "",
    [string]$Notes = ""
)

$ErrorActionPreference = "Stop"
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
    $placeholders = @("TBD", "TODO", "PENDING", "UNSIGNED", "FAIL", "待补", "待定")
    return -not ($placeholders | Where-Object {
        [string]::Equals($trimmed, $_, [StringComparison]::OrdinalIgnoreCase) -or
            [string]::Equals($tail, $_, [StringComparison]::OrdinalIgnoreCase)
    } | Select-Object -First 1)
}

function Get-EvidenceReferencePaths([string]$Value) {
    if ([string]::IsNullOrWhiteSpace($Value)) {
        return @()
    }

    return @($Value |
        Select-String -AllMatches -Pattern '(?:_docs|output)/[A-Za-z0-9._/-]+\.(?:md|png|jpg|jpeg|webp|json|txt|log|zip|html|pdf|csv)' |
        ForEach-Object { $_.Matches } |
        ForEach-Object { $_.Value.TrimEnd(',', ';', '.', ':', ')', ']') })
}

function Test-EvidenceReferenceExists([string]$Value) {
    if ([string]::IsNullOrWhiteSpace($Value)) {
        return $false
    }

    $evidenceReferences = Get-EvidenceReferencePaths $Value
    if ($evidenceReferences.Count -eq 0) {
        return $true
    }

    foreach ($evidencePath in $evidenceReferences) {
        $relativePath = $evidencePath.Replace('/', [System.IO.Path]::DirectorySeparatorChar)
        $candidate = Join-Path $script:repositoryRoot $relativePath
        if (-not (Test-Path $candidate)) {
            return $false
        }
    }

    return $true
}

function Test-ParseableTimestampNotFuture([string]$Value, [ref]$Timestamp) {
    if (-not (Test-HasValue $Value)) {
        return $false
    }

    try {
        $parsed = [DateTimeOffset]::Parse($Value)
        $Timestamp.Value = $parsed
        return $parsed -le [DateTimeOffset]::UtcNow
    } catch {
        return $false
    }
}

$reportDirectory = Split-Path -Parent $ReportPath
if (-not [string]::IsNullOrWhiteSpace($reportDirectory)) {
    New-Item -ItemType Directory -Force -Path $reportDirectory | Out-Null
}

$violations = New-Object System.Collections.Generic.List[string]

if ($Status -eq "DRAFT") {
    $violations.Add("Incident review is still DRAFT.")
}

if (-not (Test-RealEvidence $Reviewer)) {
    $violations.Add("Reviewer is required. Reviewer cannot be a placeholder.")
}

if (-not (Test-RealEvidence $MonitoringSource)) {
    $violations.Add("MonitoringSource is required. MonitoringSource cannot be a placeholder.")
}

if (-not (Test-RealEvidence $IncidentQueryEvidence)) {
    $violations.Add("IncidentQueryEvidence is required. IncidentQueryEvidence cannot be a placeholder.")
} elseif (-not (Test-EvidenceReferenceExists $IncidentQueryEvidence)) {
    $violations.Add("IncidentQueryEvidence repo-local reference does not exist. Evidence reference does not exist.")
}

if (-not (Test-RealEvidence $GrayReleaseId)) {
    $violations.Add("GrayReleaseId is required. GrayReleaseId cannot be a placeholder.")
}

$reviewedAtTimestamp = [DateTimeOffset]::MinValue
$observationStartedTimestamp = [DateTimeOffset]::MinValue
$observationEndedTimestamp = [DateTimeOffset]::MinValue

if (-not (Test-ParseableTimestampNotFuture $ReviewedAt ([ref]$reviewedAtTimestamp))) {
    $violations.Add("ReviewedAt must be a parseable timestamp and must not be in the future.")
}

if (-not (Test-ParseableTimestampNotFuture $ObservationStartedAt ([ref]$observationStartedTimestamp))) {
    $violations.Add("ObservationStartedAt must be a parseable timestamp and must not be in the future.")
}

if (-not (Test-ParseableTimestampNotFuture $ObservationEndedAt ([ref]$observationEndedTimestamp))) {
    $violations.Add("ObservationEndedAt must be a parseable timestamp and must not be in the future.")
}

if ($observationStartedTimestamp -ne [DateTimeOffset]::MinValue -and $observationEndedTimestamp -ne [DateTimeOffset]::MinValue) {
    if (($observationEndedTimestamp - $observationStartedTimestamp).TotalDays -lt 14) {
        $violations.Add("Incident review PASS requires an observation window of at least 14 calendar days.")
    }
}

if ($P0IncidentCount -ne 0 -or $P1IncidentCount -ne 0) {
    $violations.Add("Incident review PASS requires zero P0/P1 incidents during the observation window.")
}

$result = if ($violations.Count -eq 0) { "PASS" } else { "FAIL" }

$script:reportLines = @()
Add-Line "# Gray incident review"
Add-Line ""
Add-Line "- GeneratedAt: $(Get-Date -Format o)"
Add-Line "- Status: $Status"
Add-Line "- GrayReleaseId: $GrayReleaseId"
Add-Line "- Reviewer: $Reviewer"
Add-Line "- ReviewedAt: $ReviewedAt"
Add-Line "- MonitoringSource: $MonitoringSource"
Add-Line "- ObservationStartedAt: $ObservationStartedAt"
Add-Line "- ObservationEndedAt: $ObservationEndedAt"
Add-Line "- Required observation window: 14 calendar days"
Add-Line "- P0/P1 incident counts: P0=$P0IncidentCount; P1=$P1IncidentCount"
Add-Line "- IncidentQueryEvidence: $IncidentQueryEvidence"
Add-Line "- Notes: $Notes"
Add-Line ""
Add-Line "## Gate"
Add-Line ""
Add-Line "- Required by: strict gray observation PASS evidence."
Add-Line "- Accepted by: scripts/run-gray-observation.ps1 and scripts/run-release-gate-audit.ps1 as a reviewed monitoring or incident-review PASS packet."
Add-Line "- Result: $result"

if ($violations.Count -gt 0) {
    Add-Line ""
    Add-Line "## Violations"
    Add-Line ""
    foreach ($violation in $violations) {
        Add-Line "- $violation"
    }
    Add-Line ""
    Add-Line "This report cannot close the strict v1.0.0 gray observation gate."
}

Set-Content -Path $ReportPath -Value $script:reportLines -Encoding UTF8
Write-Host "Gray incident review report: $ReportPath"

if ($result -ne "PASS") {
    throw "Gray incident review gate failed. See $ReportPath."
}
