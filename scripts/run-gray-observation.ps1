param(
    [string]$ReportPath = "_docs/_reports/gray-observation-latest.md",
    [ValidateSet("NOT_STARTED", "OBSERVING", "PASS")]
    [string]$Status = "NOT_STARTED",
    [string]$GrayReleaseId = "",
    [string]$GrayStartedAt = "",
    [string]$ObservationStartedAt = "",
    [string]$ObservationEndedAt = "",
    [int]$P0IncidentCount = -1,
    [int]$P1IncidentCount = -1,
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

$reportDirectory = Split-Path -Parent $ReportPath
if (-not [string]::IsNullOrWhiteSpace($reportDirectory)) {
    New-Item -ItemType Directory -Force -Path $reportDirectory | Out-Null
}

$violations = New-Object System.Collections.Generic.List[string]

if ($Status -eq "NOT_STARTED") {
    $violations.Add("First gray release has not started.")
}

if ($Status -eq "OBSERVING") {
    $violations.Add("Gray observation is still running.")
}

if ($Status -ne "NOT_STARTED" -and -not (Test-RealEvidence $GrayReleaseId)) {
    $violations.Add("GrayReleaseId is required after gray release starts. GrayReleaseId cannot be a placeholder.")
}

if ($Status -ne "NOT_STARTED" -and -not (Test-HasValue $GrayStartedAt)) {
    $violations.Add("GrayStartedAt is required after gray release starts.")
}

if ($Status -eq "PASS") {
    if (-not (Test-HasValue $ObservationStartedAt)) {
        $violations.Add("ObservationStartedAt is required for PASS.")
    }

    if (-not (Test-HasValue $ObservationEndedAt)) {
        $violations.Add("ObservationEndedAt is required for PASS.")
    }

    if ($P0IncidentCount -ne 0 -or $P1IncidentCount -ne 0) {
        $violations.Add("PASS requires zero P0/P1 incidents during the observation window.")
    }

    try {
        $grayStarted = [DateTimeOffset]::Parse($GrayStartedAt)
        $started = [DateTimeOffset]::Parse($ObservationStartedAt)
        $ended = [DateTimeOffset]::Parse($ObservationEndedAt)
        if ($grayStarted -gt $started) {
            $violations.Add("GrayStartedAt must not be after ObservationStartedAt.")
        }

        if ($ended -gt [DateTimeOffset]::UtcNow) {
            $violations.Add("ObservationEndedAt must not be in the future.")
        }

        if (($ended - $started).TotalDays -lt 14) {
            $violations.Add("PASS requires an observation window of at least 14 calendar days.")
        }
    } catch {
        $violations.Add("GrayStartedAt, ObservationStartedAt, and ObservationEndedAt must be parseable timestamps for PASS.")
    }

    if (-not (Test-RealEvidence $Evidence)) {
        $violations.Add("PASS requires evidence links or incident query references. Evidence cannot be a placeholder.")
    }
}

$result = if ($violations.Count -eq 0) { "PASS" } else { "FAIL" }

$script:reportLines = @()
Add-Line "# Gray observation"
Add-Line ""
Add-Line "- GeneratedAt: $(Get-Date -Format o)"
Add-Line "- Status: $Status"
Add-Line "- GrayReleaseId: $GrayReleaseId"
Add-Line "- GrayStartedAt: $GrayStartedAt"
Add-Line "- ObservationStartedAt: $ObservationStartedAt"
Add-Line "- ObservationEndedAt: $ObservationEndedAt"
Add-Line "- Required observation window: 14 calendar days"
Add-Line "- P0/P1 incident counts: P0=$P0IncidentCount; P1=$P1IncidentCount"
Add-Line "- Evidence: $Evidence"
Add-Line ""
Add-Line "## Gate"
Add-Line ""
Add-Line "- First gray release: required before v1.0.0."
Add-Line "- Observation window: 2 weeks with no P0/P1 incidents."
Add-Line "- Result: $result"

if ($violations.Count -gt 0) {
    Add-Line ""
    Add-Line "## Violations"
    Add-Line ""
    foreach ($violation in $violations) {
        Add-Line "- $violation"
    }
    Add-Line ""
    Add-Line "This report cannot close the v1.0.0 release gate."
}

Set-Content -Path $ReportPath -Value $script:reportLines -Encoding UTF8
Write-Host "Gray observation report: $ReportPath"

if ($result -ne "PASS") {
    throw "Gray observation gate failed. See $ReportPath."
}
