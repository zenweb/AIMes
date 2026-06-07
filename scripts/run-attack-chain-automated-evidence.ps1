param(
    [string]$ReportPath = "_docs/_reports/attack-chain-automated-evidence-latest.md"
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
    "# Attack Chain automated support evidence",
    "",
    "- GeneratedAt: $(Get-Date -Format o)",
    "- Scope: automated support evidence for manual Attack Chain A/B/C verification",
    "- Manual gate boundary: this report does not replace verifier, VerifiedAt, or human evidence in run-attack-chain-verification.ps1.",
    "",
    "## Mapping",
    "",
    "- Attack Chain A: anonymous/low-privilege access and role matrix.",
    "- Attack Chain B: credential/token/audit payload leakage controls.",
    "- Attack Chain C: release security configuration and vulnerable package promotion controls."
)

try {
    Invoke-AndCapture "Attack Chain A - endpoint authorization" {
        dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --no-restore --filter "FullyQualifiedName~EndpointAuthorizationTests"
    }

    Invoke-AndCapture "Attack Chain A - agent role matrix" {
        dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore --filter "FullyQualifiedName~AgentPermissionPolicyTests"
    }

    Invoke-AndCapture "Attack Chain B - credential and token leakage controls" {
        dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --no-restore --filter "FullyQualifiedName~AdminControllerTests.CreateUser_ShouldRedactPasswordInAuditLog|FullyQualifiedName~AuthControllerTests.Login_ShouldPersistOnlyHashedRefreshToken|FullyQualifiedName~AuthControllerTests.Login_WithInvalidPassword_ShouldReturnUnauthorized"
    }

    Invoke-AndCapture "Attack Chain C - release security configuration gates" {
        dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore --filter "FullyQualifiedName~M1M2JwtConfiguration_ShouldUseValidatedOptionsInsteadOfRawConfiguration|FullyQualifiedName~M1M2CorsConfiguration_ShouldUseValidatedOptionsInsteadOfRawConfiguration|FullyQualifiedName~H21DirectoryBuildProps_ShouldNotSuppressHighSeverityNuGetAuditWarnings|FullyQualifiedName~SecuritySelfAssessment_ShouldFailLoudOnVulnerablePackageOutput"
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
    Write-Host "Attack Chain automated evidence report: $ReportPath"
}
