param(
    [string]$ReportPath = "_docs/_reports/employee-production-scheduling-evidence-latest.md"
)

$ErrorActionPreference = "Stop"

function Write-Step([string]$Message) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] $Message"
}

function Invoke-AndCapture([string]$Label, [scriptblock]$Command) {
    Write-Step $Label
    try {
        $output = & $Command 2>&1
        $exitCode = if ($null -eq $LASTEXITCODE) { 0 } else { $LASTEXITCODE }
    } catch {
        $output = @($_.Exception.Message)
        $exitCode = 1
    }

    $script:reportLines += ""
    $script:reportLines += "## $Label"
    $script:reportLines += ""
    $script:reportLines += '```text'
    $script:reportLines += ($output | ForEach-Object { [string]$_ })
    $script:reportLines += '```'
    $script:reportLines += ""
    $script:reportLines += "Exit code: $exitCode"

    if ($exitCode -ne 0) {
        throw "$Label failed with exit code $exitCode."
    }
}

$reportDirectory = Split-Path -Parent $ReportPath
if (-not [string]::IsNullOrWhiteSpace($reportDirectory)) {
    New-Item -ItemType Directory -Force -Path $reportDirectory | Out-Null
}

$script:reportLines = @(
    "# Employee -> Production -> Scheduling evidence chain",
    "",
    "- GeneratedAt: $(Get-Date -Format o)",
    "- Scope: focused backend evidence for operation-code ordering, production scan handoff, and scheduling context readback.",
    "- Boundary: this is not the full integration suite; it is a bounded Sprint 0 evidence-chain smoke script."
)

try {
    Invoke-AndCapture "Reset dotnet build servers" {
        dotnet build-server shutdown
    }

    Invoke-AndCapture "OperationCode numeric sequence value object" {
        dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore /p:SkipFrontendBuildCopy=true --filter "FullyQualifiedName~OperationCodeTests"
    }

    Invoke-AndCapture "Production operation service handoff ordering" {
        dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore /p:SkipFrontendBuildCopy=true --filter "FullyQualifiedName~OperationServiceTests"
    }

    Invoke-AndCapture "Operation repository numeric ordering" {
        dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --no-restore /p:SkipFrontendBuildCopy=true --filter "FullyQualifiedName~OperationRepositoryTests"
    }

    Invoke-AndCapture "Scheduling context WIP ordering" {
        dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --no-restore /p:SkipFrontendBuildCopy=true --filter "FullyQualifiedName~SchedulingContextProviderTests"
    }

    Invoke-AndCapture "Production controller scan next-operation readback" {
        dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --no-restore /p:SkipFrontendBuildCopy=true --filter "FullyQualifiedName~ProductionControllerTests"
    }

    $script:reportLines += ""
    $script:reportLines += "Result: PASS"
} catch {
    $script:reportLines += ""
    $script:reportLines += "Result: FAIL"
    $script:reportLines += ""
    $script:reportLines += "Failure: $($_.Exception.Message)"
    throw
} finally {
    $script:reportLines += ""
    $script:reportLines += "- FinishedAt: $(Get-Date -Format o)"
    Set-Content -Path $ReportPath -Value $script:reportLines -Encoding UTF8
    Write-Host "Employee -> Production -> Scheduling evidence report: $ReportPath"
}
