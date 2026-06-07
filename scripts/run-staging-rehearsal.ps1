param(
    [string]$ReportPath = "_docs/_reports/staging-rehearsal-latest.md",
    [string]$ApiBaseUrl = "http://localhost:5000",
    [int]$ReadyTimeoutSeconds = 120,
    [int]$DockerPullTimeoutSeconds = 90,
    [ValidateSet("Always", "Missing", "Never")]
    [string]$ImagePullMode = "Always"
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

function Assert-DockerEngineAvailable() {
    $infoOutput = docker info 2>&1
    $exitCode = if ($null -eq $LASTEXITCODE) { 0 } else { $LASTEXITCODE }
    if ($exitCode -ne 0) {
        $message = @(
            "Docker daemon is unavailable.",
            "docker info exit code: $exitCode",
            ($infoOutput | ForEach-Object { [string]$_ })
        ) -join [Environment]::NewLine
        throw $message
    }

    $infoOutput
}

function Wait-HealthEndpoint([string]$Path) {
    $deadline = (Get-Date).AddSeconds($ReadyTimeoutSeconds)
    $uri = "$ApiBaseUrl$Path"

    do {
        try {
            $response = Invoke-WebRequest -Uri $uri -UseBasicParsing -TimeoutSec 5
            if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 300) {
                $script:reportLines += ""
                $script:reportLines += "## Health $Path"
                $script:reportLines += ""
                $script:reportLines += "HTTP $($response.StatusCode)"
                $script:reportLines += ""
                $script:reportLines += '```json'
                $script:reportLines += $response.Content
                $script:reportLines += '```'
                return
            }
        } catch {
            Start-Sleep -Seconds 3
        }
    } while ((Get-Date) -lt $deadline)

    throw "Health endpoint $uri did not become ready within $ReadyTimeoutSeconds seconds."
}

function Invoke-DockerPullWithTimeout([string]$Image) {
    $stdoutPath = [System.IO.Path]::GetTempFileName()
    $stderrPath = [System.IO.Path]::GetTempFileName()

    try {
        Write-Output "Pulling $Image"
        $process = Start-Process `
            -FilePath "docker" `
            -ArgumentList @("pull", $Image) `
            -NoNewWindow `
            -PassThru `
            -RedirectStandardOutput $stdoutPath `
            -RedirectStandardError $stderrPath

        if (-not (Wait-Process -Id $process.Id -Timeout $DockerPullTimeoutSeconds -ErrorAction SilentlyContinue)) {
            Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
            throw "docker pull $Image timed out after $DockerPullTimeoutSeconds seconds. Check Docker Desktop HTTPS proxy, registry mirror, or pre-pull the image."
        }

        $stdout = Get-Content -Path $stdoutPath -ErrorAction SilentlyContinue
        $stderr = Get-Content -Path $stderrPath -ErrorAction SilentlyContinue
        if ($stdout) { $stdout }
        if ($stderr) { $stderr }

        if ($process.ExitCode -ne 0) {
            throw "docker pull $Image failed with exit code $($process.ExitCode)."
        }
    } finally {
        Remove-Item -Path $stdoutPath, $stderrPath -Force -ErrorAction SilentlyContinue
    }
}

function Test-DockerImageExists([string]$Image) {
    $existingErrorActionPreference = $ErrorActionPreference
    try {
        $ErrorActionPreference = "Continue"
        docker image inspect $Image *> $null
        return $LASTEXITCODE -eq 0
    } finally {
        $ErrorActionPreference = $existingErrorActionPreference
    }
}

function Assert-DockerImagesAvailable([string[]]$Images) {
    $missingImages = @($Images | Where-Object { -not (Test-DockerImageExists $_) })
    if ($missingImages.Count -gt 0) {
        throw "Missing required local Docker images: $($missingImages -join ', '). Configure Docker Desktop HTTPS proxy or registry mirror, pre-pull these images, or use -ImagePullMode Always/Missing."
    }
}

$reportDirectory = Split-Path -Parent $ReportPath
if (-not [string]::IsNullOrWhiteSpace($reportDirectory)) {
    New-Item -ItemType Directory -Force -Path $reportDirectory | Out-Null
}

$migrationConnectionString = "Host=localhost;Database=mes;Username=postgres;Password=postgres"
$externalDependencyImages = @(
    "postgres:16-alpine",
    "redis:7-alpine",
    "rabbitmq:4-management-alpine",
    "qdrant/qdrant:latest"
)

$script:reportLines = @(
    "# PostgreSQL/Staging Rehearsal Evidence",
    "",
    "- Started at: $(Get-Date -Format o)",
    "- ASPNETCORE_ENVIRONMENT: Production",
    "- ConnectionStrings__DefaultConnection: Host=postgresql;Database=mes;Username=postgres;Password=***",
    "- Migration connection string: Host=localhost;Database=mes;Username=postgres;Password=***",
    "- API base URL: $ApiBaseUrl",
    "- DockerPullTimeoutSeconds: $DockerPullTimeoutSeconds",
    "- ImagePullMode: $ImagePullMode"
)

try {
    Invoke-AndCapture "Docker version" { docker --version; docker compose version }
    Invoke-AndCapture "Docker engine" { Assert-DockerEngineAvailable }
    Invoke-AndCapture "Docker registry/proxy diagnostics" {
        "Registry mirrors:"
        docker info --format "{{json .RegistryConfig.Mirrors}}"
        "HTTP proxy:"
        docker info --format "{{.HTTPProxy}}"
        "HTTPS proxy:"
        docker info --format "{{.HTTPSProxy}}"
        "Local images:"
        docker images --format "{{.Repository}}:{{.Tag}} {{.ID}}"
    }
    Invoke-AndCapture "Resolve external dependency images" {
        if ($ImagePullMode -eq "Never") {
            Assert-DockerImagesAvailable $externalDependencyImages
            "All required external dependency images are already available locally."
            return
        }

        foreach ($image in $externalDependencyImages) {
            if ($ImagePullMode -eq "Missing" -and (Test-DockerImageExists $image)) {
                "Using local image $image"
                continue
            }
            Invoke-DockerPullWithTimeout $image
        }
    }
    Invoke-AndCapture "Start external dependencies" { docker compose up -d postgresql redis rabbitmq qdrant }
    Invoke-AndCapture "Apply EF migrations" {
        $env:ASPNETCORE_ENVIRONMENT = "Production"
        $env:ConnectionStrings__DefaultConnection = $migrationConnectionString
        dotnet ef database update --project src/backend/MES.Infrastructure --startup-project src/backend/MES.Api
    }
    Invoke-AndCapture "Start API" { docker compose up -d api }
    Wait-HealthEndpoint "/live"
    Wait-HealthEndpoint "/ready"

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
    Write-Host "Staging rehearsal report: $ReportPath"
}
