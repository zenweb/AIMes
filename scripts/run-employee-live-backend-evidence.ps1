param(
    [string]$ReportPath = "_docs/_reports/employee-live-backend-evidence-20260630-5002-current.md",
    [string]$ApiBaseUrl = "http://127.0.0.1:5002",
    [string]$BackendHealthUrl = ""
)

$ErrorActionPreference = "Stop"
$script:RepositoryRoot = Split-Path -Parent $PSScriptRoot
$script:FrontendRoot = Join-Path $script:RepositoryRoot "src/frontend"
$script:ReportLines = @()

if ([string]::IsNullOrWhiteSpace($BackendHealthUrl)) {
    $BackendHealthUrl = "$ApiBaseUrl/health"
}

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

Add-Line "# Employee live backend frontend evidence"
Add-Line ""
Add-Line "- GeneratedAt: $(Get-Date -Format o)"
Add-Line "- Scope: Employee stale offline-demo recovery through live login and authenticated backend employee read."
Add-Line "- Boundary: this is a focused real-browser smoke check, not the full frontend e2e suite or release gate."
Add-Line "- ApiBaseUrl: $ApiBaseUrl"
Add-Line "- BackendHealthUrl: $BackendHealthUrl"

Push-Location $script:RepositoryRoot
try {
    Invoke-AndCapture "Backend health preflight" {
        Invoke-WebRequest -UseBasicParsing -Uri $BackendHealthUrl -TimeoutSec 5 | Select-Object StatusCode, Content
    }
} finally {
    Pop-Location
}

Push-Location $script:FrontendRoot
try {
    Invoke-AndCapture "Employee live backend unit regressions" {
        npm run test:unit -- tests/unit/offline-demo-mode.test.ts tests/unit/employee-board.test.ts tests/unit/router-auth.test.ts tests/unit/nuxt-auth-middleware.test.ts
    }

    Invoke-AndCapture "Employee live backend real browser entry" {
        $env:AIMES_E2E_LIVE_BACKEND = "true"
        $env:AIMES_LIVE_API_BASE_URL = $ApiBaseUrl
        Remove-Item Env:AIMES_E2E_OFFLINE_DEMO -ErrorAction SilentlyContinue
        Remove-Item Env:VITE_API_TARGET -ErrorAction SilentlyContinue
        npm run test:e2e -- tests/e2e/employee.spec.ts -g "employee-live-backend"
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
    Write-Host "Employee live backend frontend evidence report: $ReportPath"
}
