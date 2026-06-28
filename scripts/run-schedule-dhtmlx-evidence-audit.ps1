param(
    [string]$ReportPath = "_docs/_reports/schedule-dhtmlx-evidence-audit-latest.md"
)

$ErrorActionPreference = "Stop"
$script:RepositoryRoot = Split-Path -Parent $PSScriptRoot
$script:ReportLines = @()
$script:Violations = New-Object System.Collections.Generic.List[string]

function Add-Line([string]$Line = "") {
    $script:ReportLines += $Line
}

function Resolve-RepoPath([string]$Path) {
    Join-Path $script:RepositoryRoot ($Path.Replace("/", [System.IO.Path]::DirectorySeparatorChar))
}

function Test-Artifact([string]$Path) {
    $fullPath = Resolve-RepoPath $Path
    if (-not (Test-Path $fullPath)) {
        $script:Violations.Add("Missing artifact: $Path")
        return $false
    }

    return $true
}

function Test-Manifest([string]$Path, [string[]]$Tokens) {
    $fullPath = Resolve-RepoPath $Path
    if (-not (Test-Path $fullPath)) {
        $script:Violations.Add("Missing manifest: $Path")
        return $false
    }

    $text = Get-Content -Raw -Path $fullPath
    $isPass = $true
    foreach ($token in $Tokens) {
        if (-not $text.Contains($token)) {
            $script:Violations.Add("Manifest $Path missing token: $token")
            $isPass = $false
        }
    }

    return $isPass
}

function Add-Evidence(
    [string]$Name,
    [string]$Manifest,
    [string[]]$Tokens,
    [string[]]$Artifacts
) {
    $manifestPass = Test-Manifest $Manifest $Tokens
    $artifactPass = $true
    foreach ($artifact in $Artifacts) {
        if (-not (Test-Artifact $artifact)) {
            $artifactPass = $false
        }
    }

    $status = if ($manifestPass -and $artifactPass) { "PASS" } else { "FAIL" }
    Add-Line "| $Name | $status | $Manifest | $($Artifacts -join '<br>') |"
}

$reportDirectory = Split-Path -Parent $ReportPath
if (-not [string]::IsNullOrWhiteSpace($reportDirectory)) {
    New-Item -ItemType Directory -Force -Path (Resolve-RepoPath $reportDirectory) | Out-Null
}

Add-Line "# Schedule real dhtmlx evidence audit"
Add-Line ""
Add-Line "- GeneratedAt: $(Get-Date -Format o)"
Add-Line "- Scope: Scheduling drag-save evidence package"
Add-Line ""
Add-Line "## Evidence Summary"
Add-Line ""
Add-Line "| Evidence | Status | Manifest | Artifacts |"
Add-Line "| --- | --- | --- | --- |"

$tokens = @("real-dhtmlx-drag-writeback-saved.png", "scheduling.spec.ts", "plan-dhtmlx-e2e/items/dhtmlx-item-rush")
$artifacts = @("output/playwright/20260612-schedule-rush-formal-writeback/real-dhtmlx-drag-writeback-saved.png")
Add-Evidence "Mock save success" "output/playwright/20260612-schedule-rush-formal-writeback/real-dhtmlx-drag-writeback-manifest.md" $tokens $artifacts

$tokens = @("real-dhtmlx-drag-refresh-readback.png", "plannedStartTime/plannedEndTime", "PATCH mock")
$artifacts = @("output/playwright/20260612-schedule-rush-formal-writeback/real-dhtmlx-drag-refresh-readback.png")
Add-Evidence "Mock refresh readback" "output/playwright/20260612-schedule-rush-formal-writeback/real-dhtmlx-drag-refresh-readback-manifest.md" $tokens $artifacts

$tokens = @("real-dhtmlx-drag-writeback-failed.png", "scheduling.spec.ts", "real-dhtmlx")
$artifacts = @("output/playwright/20260612-schedule-rush-formal-writeback/real-dhtmlx-drag-writeback-failed.png")
Add-Evidence "Mock rejected save" "output/playwright/20260612-schedule-rush-formal-writeback/real-dhtmlx-drag-writeback-failed-manifest.md" $tokens $artifacts

$tokens = @("live-staging-dhtmlx-drag-save-status.png", "live-staging-dhtmlx-drag-refresh-readback.png", "PostgreSQL")
$artifacts = @(
    "output/playwright/20260612-schedule-live-staging/live-staging-dhtmlx-drag-save-status.png",
    "output/playwright/20260612-schedule-live-staging/live-staging-dhtmlx-drag-refresh-readback.png"
)
Add-Evidence "Live staging save readback" "output/playwright/20260612-schedule-live-staging/live-staging-dhtmlx-drag-refresh-readback-manifest.md" $tokens $artifacts

$tokens = @("Locked", "PATCH status", "400", "live-staging-dhtmlx-drag-locked-plan-rejected.png")
$artifacts = @("output/playwright/20260612-schedule-live-staging/live-staging-dhtmlx-drag-locked-plan-rejected.png")
Add-Evidence "Live staging rejected save" "output/playwright/20260612-schedule-live-staging/live-staging-dhtmlx-drag-locked-plan-rejected-manifest.md" $tokens $artifacts

$result = if ($script:Violations.Count -eq 0) { "PASS" } else { "FAIL" }

Add-Line ""
Add-Line "## Gate"
Add-Line ""
Add-Line "- Result: $result"

if ($script:Violations.Count -gt 0) {
    Add-Line ""
    Add-Line "## Violations"
    Add-Line ""
    foreach ($violation in $script:Violations) {
        Add-Line "- $violation"
    }
}

Set-Content -Path (Resolve-RepoPath $ReportPath) -Value $script:ReportLines -Encoding UTF8
Write-Host "Schedule dhtmlx evidence audit report: $ReportPath"

if ($result -ne "PASS") {
    throw "Schedule dhtmlx evidence audit failed. See $ReportPath."
}
