$ErrorActionPreference = "Stop"

$scriptPath = Join-Path $PSScriptRoot "run-postgresql-backup-restore.ps1"
if (-not (Test-Path $scriptPath)) {
    throw "Backup/restore script is missing: $scriptPath"
}

$source = Get-Content -Raw -Path $scriptPath
$requiredContracts = @(
    "PlanOnly",
    "pg_dump",
    "pg_restore",
    "restore container",
    "finally"
)

foreach ($contract in $requiredContracts) {
    if (-not $source.Contains($contract)) {
        throw "Backup/restore script is missing required contract: $contract"
    }
}

$reportPath = Join-Path ([IO.Path]::GetTempPath()) "aimes-backup-restore-contract-$([guid]::NewGuid().ToString('N')).md"
try {
    & pwsh -NoProfile -ExecutionPolicy Bypass -File $scriptPath -PlanOnly -ReportPath $reportPath
    if ($LASTEXITCODE -ne 0) {
        throw "Plan-only mode exited with code $LASTEXITCODE"
    }

    $report = Get-Content -Raw -Path $reportPath
    if (-not $report.Contains("- Result: PASS")) {
        throw "Plan-only report did not contain a PASS result."
    }
} finally {
    Remove-Item -LiteralPath $reportPath -Force -ErrorAction SilentlyContinue
}

Write-Output "postgresql-backup-restore-contracts: PASS"
