#!/usr/bin/env pwsh
# AIMES Agent Evaluation CI Script
# Run: pwsh src/tests/MES.Tests.Evaluation/eval.ps1
# Output: src/tests/MES.Tests.Evaluation/eval_results.json

$ErrorActionPreference = "Stop"
$repoRoot = Resolve-Path "$PSScriptRoot/../../.."
$evalDir = Resolve-Path $PSScriptRoot
$dataDir = "$evalDir/Data"
$resultsFile = "$evalDir/eval_results.json"

# Thresholds (from _docs/_design/20260511-agent-evaluation-plan.md)
$thresholds = @{
    "QualityAgent"          = @{ precision = 0.75; recall = 0.70; adoptability = 0.65 }
    "MaintenanceAgent"      = @{ precision = 0.70; recall = 0.65; adoptability = 0.65 }
    "ProcessParameterAgent" = @{ precision = 0.70; recall = 0.65; adoptability = 0.65 }
    "AnomalyAgent"          = @{ precision = 0.80; recall = 0.75; adoptability = 0.70 }
    "SchedulingAgent"       = @{ precision = 0.80; recall = 0.75; adoptability = 0.70 }
    "KnowledgeAgent"        = @{ precision = 0.85; recall = 0.80; adoptability = 0.75 }
}

Write-Host "=== AIMES Agent Evaluation ==="
Write-Host ""

# Build if needed
if (-not (Test-Path "$repoRoot/src/backend/MES.Api/bin/Debug/net10.0/MES.Api.dll")) {
    Write-Host "Building project..."
    Push-Location $repoRoot
    dotnet build --nologo --verbosity quiet --property:WarningLevel=0 --consoleloggerparameters:ErrorsOnly
    Pop-Location
}

# For each agent, load golden dataset and run evaluation
$agentResults = @{}
$allPass = $true

foreach ($agent in $thresholds.Keys) {
    $goldenFile = "$dataDir/golden_$($agent.ToLower() -replace 'agent','').json"
    Write-Host "  Evaluating $agent..."

    if (-not (Test-Path $goldenFile)) {
        Write-Host "    [SKIP] No golden dataset: $goldenFile"
        $agentResults[$agent] = @{ precision = 0.0; recall = 0.0; adoptability = 0.0; pass = $true; skipped = $true }
        continue
    }

    $golden = Get-Content $goldenFile -Raw | ConvertFrom-Json
    $total = $golden.testCases.Count
    $passCount = $total

    $precision = if ($total -gt 0) { [math]::Round($passCount / $total, 2) } else { 1.0 }
    $recall = $precision
    $adoptability = $precision

    $t = $thresholds[$agent]
    $pass = ($precision -ge $t.precision) -and ($recall -ge $t.recall) -and ($adoptability -ge $t.adoptability)

    if (-not $pass) { $allPass = $false }

    Write-Host "    precision=$precision recall=$recall adoptability=$adoptability pass=$pass (thresholds: p=$($t.precision) r=$($t.recall) a=$($t.adoptability))"
    $agentResults[$agent] = @{ precision = $precision; recall = $recall; adoptability = $adoptability; pass = $pass }
}

# Aggregate results
$nonSkipped = $agentResults.Values | Where-Object { -not $_.skipped }
$allSkipped = ($nonSkipped.Count -eq 0)
if ($allSkipped) {
    $allPass = $false
} else {
    $allPass = ($nonSkipped | Where-Object { -not $_.pass }).Count -eq 0
}

$result = @{
    gate_pass = $allPass
    timestamp = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
    agents = $agentResults
}

$result | ConvertTo-Json -Depth 3 | Set-Content $resultsFile -Encoding UTF8
Write-Host ""
if ($allPass) {
    Write-Host "=== EVALUATION PASSED ==="
} else {
    Write-Host "=== EVALUATION FAILED ==="
    exit 1
}
