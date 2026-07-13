$ErrorActionPreference = "Stop"

$scriptPath = Join-Path $PSScriptRoot "import-gray-incident-evidence.ps1"
if (-not (Test-Path $scriptPath)) {
    throw "Gray incident evidence importer is missing: $scriptPath"
}

$tempRoot = Join-Path ([IO.Path]::GetTempPath()) "aimes-gray-import-$([guid]::NewGuid().ToString('N'))"
New-Item -ItemType Directory -Force -Path $tempRoot | Out-Null
$csvPath = Join-Path $tempRoot "incidents.csv"
$reportPath = Join-Path $tempRoot "gray-pass.md"

try {
    @(
        "GrayReleaseId,ObservedAt,Severity,IncidentId",
        "gray-contract,2026-06-20T12:00:00Z,NONE,clean-window-20260620"
    ) | Set-Content -Path $csvPath -Encoding UTF8

    & pwsh -NoProfile -ExecutionPolicy Bypass -File $scriptPath `
        -InputPath $csvPath `
        -ReportPath $reportPath `
        -GrayReleaseId gray-contract `
        -GrayStartedAt "2026-06-13T21:38:09+08:00" `
        -ObservationStartedAt "2026-06-13T21:38:09+08:00" `
        -ObservationEndedAt "2026-06-27T21:38:09+08:00" `
        -Source "synthetic-contract-test" `
        -Reviewer "contract-test" `
        -ReviewedAt "2026-06-28T00:00:00Z"
    if ($LASTEXITCODE -ne 0) {
        throw "Gray incident evidence importer exited with code $LASTEXITCODE"
    }

    $report = Get-Content -Raw -Path $reportPath
    foreach ($token in @("Result: PASS", "P0/P1 incident counts: P0=0; P1=0", "Evidence SHA256")) {
        if (-not $report.Contains($token)) {
            throw "Imported gray report is missing required token: $token"
        }
    }

    @(
        "GrayReleaseId,ObservedAt,Severity,IncidentId",
        "gray-contract,2026-06-20T12:00:00Z,P1,incident-p1-001"
    ) | Set-Content -Path $csvPath -Encoding UTF8
    & pwsh -NoProfile -ExecutionPolicy Bypass -File $scriptPath `
        -InputPath $csvPath `
        -ReportPath $reportPath `
        -GrayReleaseId gray-contract `
        -GrayStartedAt "2026-06-13T21:38:09+08:00" `
        -ObservationStartedAt "2026-06-13T21:38:09+08:00" `
        -ObservationEndedAt "2026-06-27T21:38:09+08:00" `
        -Source "synthetic-contract-test" `
        -Reviewer "contract-test" `
        -ReviewedAt "2026-06-28T00:00:00Z" 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        throw "Gray incident evidence importer accepted a P1 incident."
    }

    $failedReport = Get-Content -Raw -Path $reportPath
    foreach ($token in @("Result: FAIL", "P0/P1 incident counts: P0=0; P1=1")) {
        if (-not $failedReport.Contains($token)) {
            throw "P1 gray report is missing required fail token: $token"
        }
    }

    @(
        "GrayReleaseId,ObservedAt,Severity,IncidentId",
        "other-release,2026-06-20T12:00:00Z,NONE,clean-window-20260620"
    ) | Set-Content -Path $csvPath -Encoding UTF8
    & pwsh -NoProfile -ExecutionPolicy Bypass -File $scriptPath `
        -InputPath $csvPath `
        -ReportPath $reportPath `
        -GrayReleaseId gray-contract `
        -GrayStartedAt "2026-06-13T21:38:09+08:00" `
        -ObservationStartedAt "2026-06-13T21:38:09+08:00" `
        -ObservationEndedAt "2026-06-27T21:38:09+08:00" `
        -Source "synthetic-contract-test" `
        -Reviewer "contract-test" `
        -ReviewedAt "2026-06-28T00:00:00Z" 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        throw "Gray incident evidence importer accepted a mismatched release id."
    }
} finally {
    Remove-Item -LiteralPath $tempRoot -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Output "gray-incident-evidence-import: PASS"
