param(
    [string]$ReportPath = "_docs/_reports/security-self-assessment-latest.md"
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

function Test-ContainsIgnoreCase([string]$Text, [string]$Value) {
    return $Text.IndexOf($Value, [StringComparison]::OrdinalIgnoreCase) -ge 0
}

function Assert-NoVulnerabilityFindings([string]$Label, [object[]]$Output) {
    $lines = @($Output | ForEach-Object { [string]$_ })
    $text = $lines -join [Environment]::NewLine
    $hasCleanChineseResult = Test-ContainsIgnoreCase $text "没有易受攻击的包"
    $hasVulnerableSummary = (Test-ContainsIgnoreCase $text "has vulnerable packages") -or
        (Test-ContainsIgnoreCase $text "has the following vulnerable packages") -or
        (Test-ContainsIgnoreCase $text "具有下列易受攻击的包")
    $hasVulnerableTableRow = $lines | Where-Object {
        $_ -match '^\s*>\s+\S+\s+\S+\s+(Low|Moderate|High|Critical)\s+' -or
        $_ -match '^\s*>\s+\S+\s+\S+\s+(低|中|高|严重)\s+'
    } | Select-Object -First 1

    if (($hasVulnerableSummary -and -not $hasCleanChineseResult) -or $hasVulnerableTableRow) {
        throw "$Label reported vulnerable packages."
    }
}

$reportDirectory = Split-Path -Parent $ReportPath
if (-not [string]::IsNullOrWhiteSpace($reportDirectory)) {
    New-Item -ItemType Directory -Force -Path $reportDirectory | Out-Null
}

$script:reportLines = @(
    "# Security self-assessment",
    "",
    "- Started at: $(Get-Date -Format o)",
    "- Scope: v1.0.0 release gate security self-assessment",
    "- Manual verification required: Attack Chain A/B/C and human signoff are not automated by this script."
)

try {
    Invoke-AndCapture "MES.Tests.Unit security tests" {
        dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore /p:SkipFrontendBuildCopy=true --filter "FullyQualifiedName~Security|FullyQualifiedName~Authorization"
    }
    Invoke-AndCapture "MES.Tests.Integration security tests" {
        dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --no-restore /p:SkipFrontendBuildCopy=true --filter "FullyQualifiedName~Security"
    }
    Invoke-AndCapture "MES.ArchitectureTests security gates" {
        dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore /p:SkipFrontendBuildCopy=true --filter "FullyQualifiedName~Security|FullyQualifiedName~Authorization|FullyQualifiedName~Audit|FullyQualifiedName~H20GitHubActions"
    }
    Invoke-AndCapture "NuGet vulnerability audit" {
        $auditOutput = dotnet list src/backend/AIMes.slnx package --vulnerable --include-transitive
        Assert-NoVulnerabilityFindings "NuGet vulnerability audit" $auditOutput
        $auditOutput
    }
    Invoke-AndCapture "npm audit" {
        Push-Location src/frontend
        try {
            $registry = npm config get registry
            Write-Output "npm config get registry: $registry"
            npm audit --audit-level=high --registry=https://registry.npmjs.org/
        } finally {
            Pop-Location
        }
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
    $script:reportLines += "- Finished at: $(Get-Date -Format o)"
    Set-Content -Path $ReportPath -Value $script:reportLines -Encoding UTF8
    Write-Host "Security self-assessment report: $ReportPath"
}
