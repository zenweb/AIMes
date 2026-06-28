param(
    [string]$ReportPath = "_docs/_reports/frontend-real-browser-employee-offline-demo-20260621-current.md"
)

$ErrorActionPreference = "Stop"
$script:RepositoryRoot = Split-Path -Parent $PSScriptRoot
$script:FrontendRoot = Join-Path $script:RepositoryRoot "src/frontend"
$script:ReportLines = @()

function Add-Line([string]$Line = "") {
    $script:ReportLines += $Line
}

function Invoke-AndCapture([string]$Label, [scriptblock]$Command) {
    Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $Label"

    try {
        $output = & $Command 2>&1
        $exitCode = if ($null -eq $LASTEXITCODE) { 0 } else { $LASTEXITCODE }
    } catch {
        $output = @($_.Exception.Message)
        $exitCode = 1
    }

    Add-Line ""
    Add-Line "## $Label"
    Add-Line ""
    Add-Line '```text'
    foreach ($line in @($output)) {
        Add-Line ([string]$line)
    }
    Add-Line '```'
    Add-Line ""
    Add-Line "Exit code: $exitCode"

    if ($exitCode -ne 0) {
        throw "$Label failed with exit code $exitCode."
    }
}

$reportDirectory = Split-Path -Parent $ReportPath
if (-not [string]::IsNullOrWhiteSpace($reportDirectory)) {
    New-Item -ItemType Directory -Force -Path (Join-Path $script:RepositoryRoot $reportDirectory) | Out-Null
}

Add-Line "# Employee offline demo frontend evidence"
Add-Line ""
Add-Line "- GeneratedAt: $(Get-Date -Format o)"
Add-Line "- Scope: Employee offline-demo error classification plus real-browser entry evidence."
Add-Line "- Boundary: this is not the full frontend e2e suite, hosted CI, or staging proof."

Push-Location $script:FrontendRoot
try {
    Invoke-AndCapture "Employee offline-demo unit regressions" {
        npm run test:unit -- --run tests/unit/offline-demo-mode.test.ts tests/unit/employee-board.test.ts
    }

    Invoke-AndCapture "Employee offline-demo real browser entry" {
        $env:AIMES_E2E_OFFLINE_DEMO = "true"
        npm run test:e2e -- tests/e2e/employee.spec.ts -g "backend skip"
    }

    Add-Line ""
    Add-Line "Result: PASS"
} catch {
    Add-Line ""
    Add-Line "Result: FAIL"
    Add-Line ""
    Add-Line "Failure: $($_.Exception.Message)"
    throw
} finally {
    Pop-Location
    Add-Line ""
    Add-Line "- FinishedAt: $(Get-Date -Format o)"
    Set-Content -Path (Join-Path $script:RepositoryRoot $ReportPath) -Value $script:ReportLines -Encoding UTF8
    Write-Host "Employee offline demo frontend evidence report: $ReportPath"
}
