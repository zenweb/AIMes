$ErrorActionPreference = "Stop"

$scriptPath = Join-Path $PSScriptRoot "run-gray-health-observation.ps1"
if (-not (Test-Path $scriptPath)) {
    throw "Gray health observation script is missing: $scriptPath"
}

$reportPath = Join-Path ([IO.Path]::GetTempPath()) "aimes-gray-health-plan-$([guid]::NewGuid().ToString('N')).md"
$evidencePath = Join-Path ([IO.Path]::GetTempPath()) "aimes-gray-health-plan-$([guid]::NewGuid().ToString('N')).jsonl"
try {
    & pwsh -NoProfile -ExecutionPolicy Bypass -File $scriptPath `
        -PlanOnly `
        -ReportPath $reportPath `
        -EvidencePath $evidencePath `
        -GrayReleaseId "gray-contract-test"
    if ($LASTEXITCODE -ne 0) {
        throw "Gray health plan-only mode exited with code $LASTEXITCODE"
    }

    $report = Get-Content -Raw -Path $reportPath
    foreach ($token in @("- Result: PASS", "- StrictGrayGateClosed: false", "/live", "/ready", "P0/P1")) {
        if (-not $report.Contains($token)) {
            throw "Gray health plan report is missing required token: $token"
        }
    }
} finally {
    Remove-Item -LiteralPath $reportPath -Force -ErrorAction SilentlyContinue
    Remove-Item -LiteralPath $evidencePath -Force -ErrorAction SilentlyContinue
}

Write-Output "gray-health-observation-contracts: PASS"
