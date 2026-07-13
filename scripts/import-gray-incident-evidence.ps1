param(
    [Parameter(Mandatory = $true)]
    [string]$InputPath,
    [Parameter(Mandatory = $true)]
    [string]$ReportPath,
    [Parameter(Mandatory = $true)]
    [string]$GrayReleaseId,
    [Parameter(Mandatory = $true)]
    [string]$GrayStartedAt,
    [Parameter(Mandatory = $true)]
    [string]$ObservationStartedAt,
    [Parameter(Mandatory = $true)]
    [string]$ObservationEndedAt,
    [Parameter(Mandatory = $true)]
    [string]$Source,
    [Parameter(Mandatory = $true)]
    [string]$Reviewer,
    [Parameter(Mandatory = $true)]
    [string]$ReviewedAt,
    [string]$SecuritySignoffPath = "_docs/_review/20260607-security-signoff.md"
)

$ErrorActionPreference = "Stop"

function Parse-Timestamp([string]$Value, [string]$Name) {
    try {
        return [DateTimeOffset]::Parse($Value)
    } catch {
        throw "$Name must be an ISO-8601 timestamp: $Value"
    }
}

if (-not (Test-Path -LiteralPath $InputPath)) {
    throw "Gray incident evidence export does not exist: $InputPath"
}
if ([string]::IsNullOrWhiteSpace($Source) -or [string]::IsNullOrWhiteSpace($Reviewer)) {
    throw "Source and Reviewer are required for gray incident evidence."
}

$grayStarted = Parse-Timestamp $GrayStartedAt "GrayStartedAt"
$observationStarted = Parse-Timestamp $ObservationStartedAt "ObservationStartedAt"
$observationEnded = Parse-Timestamp $ObservationEndedAt "ObservationEndedAt"
$reviewed = Parse-Timestamp $ReviewedAt "ReviewedAt"
if ($grayStarted -gt $observationStarted) {
    throw "GrayStartedAt must not be after ObservationStartedAt."
}
if ($observationEnded -lt $observationStarted) {
    throw "ObservationEndedAt must not be before ObservationStartedAt."
}
if (($observationEnded - $observationStarted).TotalDays -lt 14) {
    throw "Gray incident evidence must cover at least 14 calendar days."
}
if ($observationEnded -gt [DateTimeOffset]::UtcNow) {
    throw "ObservationEndedAt must not be in the future."
}
if ($reviewed -gt [DateTimeOffset]::UtcNow) {
    throw "ReviewedAt must not be in the future."
}

$rows = @(Import-Csv -LiteralPath $InputPath)
if ($rows.Count -eq 0) {
    throw "Gray incident evidence export is empty; a clean query must include at least one NONE row."
}

$requiredColumns = @("GrayReleaseId", "ObservedAt", "Severity", "IncidentId")
$headers = @($rows[0].PSObject.Properties.Name)
foreach ($column in $requiredColumns) {
    if ($headers -notcontains $column) {
        throw "Gray incident evidence export is missing required column: $column"
    }
}

$normalizedRows = New-Object System.Collections.Generic.List[object]
foreach ($row in $rows) {
    $rowReleaseId = ([string]$row.GrayReleaseId).Trim()
    if ($rowReleaseId -ne $GrayReleaseId) {
        throw "Gray incident evidence row has release id '$rowReleaseId', expected '$GrayReleaseId'."
    }

    $observedAt = Parse-Timestamp ([string]$row.ObservedAt) "ObservedAt"
    if ($observedAt -lt $observationStarted -or $observedAt -gt $observationEnded) {
        throw "Gray incident evidence row is outside the observation window: $observedAt"
    }

    $severity = ([string]$row.Severity).Trim().ToUpperInvariant()
    if ($severity -notin @("P0", "P1", "NONE")) {
        throw "Unsupported incident severity '$severity'. Use P0, P1, or NONE."
    }

    $incidentId = ([string]$row.IncidentId).Trim()
    if ([string]::IsNullOrWhiteSpace($incidentId)) {
        throw "Gray incident evidence rows require IncidentId."
    }

    $normalizedRows.Add([pscustomobject]@{
        Severity = $severity
        IncidentId = $incidentId
        ObservedAt = $observedAt
    })
}

$p0Ids = @($normalizedRows | Where-Object Severity -eq "P0" | Select-Object -ExpandProperty IncidentId -Unique)
$p1Ids = @($normalizedRows | Where-Object Severity -eq "P1" | Select-Object -ExpandProperty IncidentId -Unique)
$p0Count = $p0Ids.Count
$p1Count = $p1Ids.Count
$hash = (Get-FileHash -Algorithm SHA256 -LiteralPath $InputPath).Hash.ToLowerInvariant()
$evidence = "Monitoring export: $InputPath; Evidence SHA256: $hash; source: $Source; reviewer: $Reviewer; reviewedAt: $ReviewedAt"

$arguments = @(
    "-NoProfile",
    "-ExecutionPolicy",
    "Bypass",
    "-File",
    (Join-Path $PSScriptRoot "run-gray-observation.ps1"),
    "-ReportPath",
    $ReportPath,
    "-Status",
    "PASS",
    "-GrayReleaseId",
    $GrayReleaseId,
    "-GrayStartedAt",
    $GrayStartedAt,
    "-ObservationStartedAt",
    $ObservationStartedAt,
    "-ObservationEndedAt",
    $ObservationEndedAt,
    "-P0IncidentCount",
    [string]$p0Count,
    "-P1IncidentCount",
    [string]$p1Count,
    "-Evidence",
    $evidence,
    "-SecuritySignoffPath",
    $SecuritySignoffPath
)

& pwsh @arguments
if ($LASTEXITCODE -ne 0) {
    throw "run-gray-observation.ps1 rejected the imported evidence."
}

Write-Host "Gray incident evidence imported: $ReportPath"
