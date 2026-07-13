$ErrorActionPreference = "Stop"

$workflowPath = Join-Path (Split-Path -Parent $PSScriptRoot) ".github/workflows/ci.yml"
$workflow = Get-Content -Raw -Path $workflowPath
$requiredTokens = @(
    "recovery:",
    "run-postgresql-backup-restore.ps1",
    "test-gray-incident-evidence-import.ps1",
    "postgresql-backup-restore.md",
    "if: always()",
    "docker compose down -v"
)

foreach ($token in $requiredTokens) {
    if (-not $workflow.Contains($token)) {
        throw "CI recovery gate is missing required token: $token"
    }
}

Write-Output "release-recovery-ci-contracts: PASS"
