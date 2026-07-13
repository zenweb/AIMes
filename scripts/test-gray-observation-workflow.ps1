$ErrorActionPreference = "Stop"

$workflowPath = Join-Path (Split-Path -Parent $PSScriptRoot) ".github/workflows/gray-observation.yml"
if (-not (Test-Path $workflowPath)) {
    throw "Gray observation workflow is missing: $workflowPath"
}

$workflow = Get-Content -Raw -Path $workflowPath
foreach ($token in @(
    "workflow_dispatch:",
    "schedule:",
    "AIMES_GRAY_BASE_URL",
    "AIMES_GRAY_RELEASE_ID",
    "run-gray-health-observation.ps1",
    "StrictGrayGateClosed",
    "upload-artifact@v7"
)) {
    if (-not $workflow.Contains($token)) {
        throw "Gray observation workflow is missing required token: $token"
    }
}

Write-Output "gray-observation-workflow-contracts: PASS"
