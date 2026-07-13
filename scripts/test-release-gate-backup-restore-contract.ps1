$ErrorActionPreference = "Stop"

$scriptPath = Join-Path $PSScriptRoot "run-release-gate-audit.ps1"
$source = Get-Content -Raw -Path $scriptPath
foreach ($token in @(
    "BackupRestoreReportPath",
    "Test-BackupRestoreEvidencePass",
    "postgresql-backup-restore",
    'Add-Gate "PostgreSQL backup/restore"'
)) {
    if (-not $source.Contains($token)) {
        throw "Release gate audit is missing backup/restore contract: $token"
    }
}

Write-Output "release-gate-backup-restore-contracts: PASS"
