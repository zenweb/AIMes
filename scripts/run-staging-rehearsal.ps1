param(
    [string]$ReportPath = "_docs/_reports/staging-rehearsal-latest.md",
    [string]$ApiBaseUrl = "http://localhost:5003",
    [int]$ReadyTimeoutSeconds = 120,
    [int]$DockerEngineTimeoutSeconds = 30,
    [int]$DockerPullTimeoutSeconds = 90,
    [ValidateSet("Always", "Missing", "Never")]
    [string]$ImagePullMode = "Always",
    [switch]$IncludeRescheduleProbe,
    [switch]$IncludeCommitmentProbe
)

$ErrorActionPreference = "Stop"

function Write-Step([string]$Message) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] $Message"
}

function Invoke-AndCapture([string]$Label, [scriptblock]$Command) {
    Write-Step $Label
    $previousErrorActionPreference = $ErrorActionPreference
    try {
        $ErrorActionPreference = "Continue"
        $output = & $Command 2>&1
        $exitCode = if ($null -eq $LASTEXITCODE) { 0 } else { $LASTEXITCODE }
    } catch {
        $output = @($_.Exception.Message)
        $exitCode = 1
    } finally {
        $ErrorActionPreference = $previousErrorActionPreference
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
    $process = $null
    try {
        $startInfo = [System.Diagnostics.ProcessStartInfo]::new()
        $startInfo.FileName = "docker"
        $startInfo.Arguments = "info"
        $startInfo.RedirectStandardOutput = $true
        $startInfo.RedirectStandardError = $true
        $startInfo.UseShellExecute = $false
        $startInfo.CreateNoWindow = $true

        $process = [System.Diagnostics.Process]::new()
        $process.StartInfo = $startInfo
        $null = $process.Start()

        if (-not $process.WaitForExit($DockerEngineTimeoutSeconds * 1000)) {
            $process.Kill()
            throw "docker info timed out after $DockerEngineTimeoutSeconds seconds. Check Docker Desktop Linux engine before running staging rehearsal."
        }

        $infoOutput = @()
        $stdout = $process.StandardOutput.ReadToEnd() -split "`r?`n" | Where-Object { $_ -ne "" }
        $stderr = $process.StandardError.ReadToEnd() -split "`r?`n" | Where-Object { $_ -ne "" }
        if ($stdout) { $infoOutput += $stdout }
        if ($stderr) { $infoOutput += $stderr }

        $dockerInfoExitCode = $process.ExitCode
        if ($dockerInfoExitCode -ne 0) {
            $messageLines = @(
                "Docker daemon is unavailable.",
                "docker info exit code: $dockerInfoExitCode"
            ) + ($infoOutput | ForEach-Object { [string]$_ })
            $message = $messageLines -join [Environment]::NewLine
            throw $message
        }

        $infoOutput
    } finally {
        if ($null -ne $process) {
            $process.Dispose()
        }
    }
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

function ConvertTo-JsonBody([object]$Body) {
    return $Body | ConvertTo-Json -Depth 10 -Compress
}

function Invoke-ApiJson(
    [string]$Method,
    [string]$Path,
    [object]$Body = $null,
    [hashtable]$Headers = @{}
) {
    $uri = "$ApiBaseUrl$Path"
    $requestHeaders = @{}
    foreach ($key in $Headers.Keys) {
        $requestHeaders[$key] = $Headers[$key]
    }

    $parameters = @{
        Method = $Method
        Uri = $uri
        UseBasicParsing = $true
        TimeoutSec = 20
        Headers = $requestHeaders
    }
    if ($null -ne $Body) {
        $parameters.ContentType = "application/json"
        $parameters.Body = ConvertTo-JsonBody $Body
    }

    Invoke-RestMethod @parameters
}

function ConvertTo-PgTimestamp([datetime]$Value) {
    $Value.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ", [System.Globalization.CultureInfo]::InvariantCulture)
}

function New-PasswordHash([string]$Password) {
    $salt = [byte[]]::new(16)
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    try {
        $rng.GetBytes($salt)
    } finally {
        $rng.Dispose()
    }
    $derive = [System.Security.Cryptography.Rfc2898DeriveBytes]::new(
        $Password,
        $salt,
        100000,
        [System.Security.Cryptography.HashAlgorithmName]::SHA256)
    try {
        $hash = $derive.GetBytes(32)
    } finally {
        $derive.Dispose()
    }

    "$([System.Convert]::ToBase64String($salt)).$([System.Convert]::ToBase64String($hash))"
}

function Invoke-PostgresSql([string]$Sql) {
    $output = $Sql | docker compose exec -T postgresql psql -U postgres -d mes -v ON_ERROR_STOP=1 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "PostgreSQL command failed with exit code $LASTEXITCODE. Output: $($output -join [Environment]::NewLine)"
    }
    $output
}

function Invoke-PostgresScalar([string]$Sql) {
    $output = $Sql | docker compose exec -T postgresql psql -U postgres -d mes -t -A -v ON_ERROR_STOP=1 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "PostgreSQL scalar command failed with exit code $LASTEXITCODE. Output: $($output -join [Environment]::NewLine)"
    }
    ($output | Select-Object -Last 1).Trim()
}

function Invoke-ReschedulePersistenceProbe() {
    $probeId = "staging-reschedule-20260612"
    $username = "staging-reschedule-probe"
    $passwordBytes = [byte[]]::new(32)
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    try {
        $rng.GetBytes($passwordBytes)
    } finally {
        $rng.Dispose()
    }
    $password = [System.Convert]::ToBase64String($passwordBytes)
    $passwordHash = New-PasswordHash $password
    $planId = "$probeId-plan"
    $itemId = "$probeId-item"
    $workOrderId = "$probeId-wo"
    $equipmentId = "$probeId-eq"
    $now = [DateTime]::UtcNow
    $planStart = [datetime]::SpecifyKind((Get-Date -Date "2026-06-12T08:00:00Z"), [DateTimeKind]::Utc)
    $planEnd = $planStart.AddHours(12)
    $originalStart = $planStart.AddHours(1)
    $originalEnd = $originalStart.AddHours(4)
    $draggedStart = $planStart.AddHours(3)
    $draggedEnd = $draggedStart.AddHours(4)

    Invoke-PostgresSql @"
INSERT INTO system_users (id, username, display_name, password_hash, role, is_active, must_change_password, created_at)
VALUES ('$probeId-user', '$username', 'Staging Reschedule Probe', '$passwordHash', 'Admin', TRUE, FALSE, TIMESTAMPTZ '$(ConvertTo-PgTimestamp $now)')
ON CONFLICT (username) DO UPDATE
SET password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    is_active = TRUE,
    must_change_password = FALSE;

DELETE FROM schedule_items WHERE id = '$itemId';
DELETE FROM schedule_plans WHERE id = '$planId';

INSERT INTO schedule_plans (id, plan_name, plan_start_date, plan_end_date, overall_utilization_rate, on_time_delivery_rate, optimization_notes, created_at)
VALUES ('$planId', 'Staging reschedule persistence probe', TIMESTAMPTZ '$(ConvertTo-PgTimestamp $planStart)', TIMESTAMPTZ '$(ConvertTo-PgTimestamp $planEnd)', 0.86, 0.95, 'staging probe', TIMESTAMPTZ '$(ConvertTo-PgTimestamp $now)');

INSERT INTO schedule_items (id, work_order_id, equipment_id, planned_start_time, planned_end_time, sequence, setup_time, "DependentItems", "SchedulePlanId")
VALUES ('$itemId', '$workOrderId', '$equipmentId', TIMESTAMPTZ '$(ConvertTo-PgTimestamp $originalStart)', TIMESTAMPTZ '$(ConvertTo-PgTimestamp $originalEnd)', 1, '20 分钟', ARRAY[]::text[], '$planId');
"@

    $login = Invoke-ApiJson `
        -Method "POST" `
        -Path "/api/v1/auth/login" `
        -Body @{ username = $username; password = $password }
    if ([string]::IsNullOrWhiteSpace($login.token)) {
        throw "Staging reschedule probe login did not return a token."
    }
    if ($login.mustChangePassword -ne $false) {
        throw "Staging reschedule probe user must not require password rotation."
    }

    $headers = @{ Authorization = "Bearer $($login.token)" }
    Invoke-ApiJson `
        -Method "PATCH" `
        -Path "/api/v1/scheduling/plans/$planId/items/$itemId" `
        -Headers $headers `
        -Body @{
            plannedStartTime = ConvertTo-PgTimestamp $draggedStart
            plannedEndTime = ConvertTo-PgTimestamp $draggedEnd
        } | Out-Null

    $plan = Invoke-ApiJson `
        -Method "GET" `
        -Path "/api/v1/scheduling/plans/$planId" `
        -Headers $headers
    $readItem = @($plan.items | Where-Object { $_.id -eq $itemId })[0]
    if ($null -eq $readItem) {
        throw "GET plan did not return probe item $itemId."
    }

    $dbWindow = Invoke-PostgresScalar "SELECT to_char(planned_start_time AT TIME ZONE 'UTC', 'YYYY-MM-DD""T""HH24:MI:SS.MS""Z""') || '|' || to_char(planned_end_time AT TIME ZONE 'UTC', 'YYYY-MM-DD""T""HH24:MI:SS.MS""Z""') FROM schedule_items WHERE id = '$itemId';"
    $expectedWindow = "$(ConvertTo-PgTimestamp $draggedStart)|$(ConvertTo-PgTimestamp $draggedEnd)"
    if ($dbWindow -ne $expectedWindow) {
        throw "PostgreSQL stored window mismatch. Expected $expectedWindow but got $dbWindow."
    }

    $apiStart = ([datetime]$readItem.plannedStartTime).ToUniversalTime()
    $apiEnd = ([datetime]$readItem.plannedEndTime).ToUniversalTime()
    if ($apiStart -ne $draggedStart -or $apiEnd -ne $draggedEnd) {
        throw "GET plan window mismatch. Expected $expectedWindow but got $(ConvertTo-PgTimestamp $apiStart)|$(ConvertTo-PgTimestamp $apiEnd)."
    }

    @(
        "Probe plan: $planId",
        "Probe item: $itemId",
        "PATCH window: $expectedWindow",
        "PostgreSQL stored window: $dbWindow",
        "GET plan window: $(ConvertTo-PgTimestamp $apiStart)|$(ConvertTo-PgTimestamp $apiEnd)"
    )
}

function Invoke-CommitmentPersistenceProbe() {
    $probeId = "staging-commitment-20260614"
    $username = "staging-commitment-probe"
    $passwordBytes = [byte[]]::new(32)
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    try {
        $rng.GetBytes($passwordBytes)
    } finally {
        $rng.Dispose()
    }
    $password = [System.Convert]::ToBase64String($passwordBytes)
    $passwordHash = New-PasswordHash $password
    $now = [DateTime]::UtcNow
    $otdCommitmentId = "$probeId-otd"
    $outsourcingCommitmentId = "$probeId-outsourcing"

    Invoke-PostgresSql @"
INSERT INTO system_users (id, username, display_name, password_hash, role, is_active, must_change_password, created_at)
VALUES ('$probeId-user', '$username', 'Staging Commitment Probe', '$passwordHash', 'Admin', TRUE, FALSE, TIMESTAMPTZ '$(ConvertTo-PgTimestamp $now)')
ON CONFLICT (username) DO UPDATE
SET password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    is_active = TRUE,
    must_change_password = FALSE;

DELETE FROM audit_logs WHERE resource_id IN ('$otdCommitmentId', '$outsourcingCommitmentId');
DELETE FROM agent_evidence_links WHERE evidence_key IN ('$otdCommitmentId', '$outsourcingCommitmentId');
"@

    $login = Invoke-ApiJson `
        -Method "POST" `
        -Path "/api/v1/auth/login" `
        -Body @{ username = $username; password = $password }
    if ([string]::IsNullOrWhiteSpace($login.token)) {
        throw "Staging commitment probe login did not return a token."
    }
    if ($login.mustChangePassword -ne $false) {
        throw "Staging commitment probe user must not require password rotation."
    }

    $headers = @{ Authorization = "Bearer $($login.token)" }
    $createdAt = ConvertTo-PgTimestamp $now

    Invoke-ApiJson `
        -Method "POST" `
        -Path "/api/v1/scheduling/otd-kpi-commitments" `
        -Headers $headers `
        -Body @{
            id = $otdCommitmentId
            sourceKpiId = "customer-huadong-staging"
            dimensionLabel = "Customer"
            targetName = "Huadong customer group"
            title = "Huadong delivery recovery commitment package"
            auditId = "AUD-STAGING-OTD-COMMITMENT-20260614"
            traceId = "TRACE-STAGING-OTD-COMMITMENT-20260614"
            actor = $username
            baselineOtd = 40.00
            agentOtd = 56.67
            lift = 16.67
            delayedReduced = 5
            statusLabel = "Pending customer confirmation"
            commitment = "Staging OTD commitment persistence probe."
            owner = "Customer success / scheduling lead"
            dueAt = "Today before 17:30"
            summary = "KPI drilldown has been converted into a customer commitment package."
            actions = @(@{
                module = "Customer delivery"
                owner = "Customer success"
                action = "Publish OTD recovery commitment basis"
                evidence = "TRACE-STAGING-OTD-COMMITMENT-ACTION-20260614"
            })
            createdAt = $createdAt
        } | Out-Null

    Invoke-ApiJson `
        -Method "POST" `
        -Path "/api/v1/scheduling/outsourcing-commitments" `
        -Headers $headers `
        -Body @{
            id = $outsourcingCommitmentId
            sourceKpiId = "product-flange-staging"
            dimensionLabel = "Product family"
            targetName = "Flange DN100"
            title = "Flange DN100 outsourcing commitment package"
            auditId = "AUD-STAGING-OUTSOURCING-COMMITMENT-20260614"
            traceId = "TRACE-STAGING-OUTSOURCING-COMMITMENT-20260614"
            actor = $username
            baselineOtd = 40.00
            agentOtd = 56.67
            lift = 16.67
            delayedReduced = 4
            statusLabel = "Schedule release confirmed"
            commitment = "Staging outsourcing commitment persistence probe."
            owner = "Purchasing / planning"
            dueAt = "2026-05-23"
            summary = "KPI drilldown has been converted into an outsourcing commitment package."
            actions = @(@{
                module = "Outsourcing coordination"
                owner = "Purchasing / planning"
                action = "Lock outsourcing promise date"
                evidence = "TRACE-STAGING-OUTSOURCING-ACTION-20260614"
            })
            partnerName = "Huadong precision outsourcing partner"
            promiseDate = "2026-05-23"
            affectedOrders = "WO-DEMO-1013"
            sourceTraceId = "TRACE-STAGING-OTD-SOURCE-20260614"
            createdAt = $createdAt
            receivedAt = $createdAt
            receivedBy = "Purchasing Wang"
            receiptAuditId = "AUD-STAGING-OUTSOURCING-RECEIPT-20260614"
            receiptTraceId = "TRACE-STAGING-OUTSOURCING-RECEIPT-20260614"
            receiptMessage = "Outsourcing arrival confirmed."
            scheduleReleasedAt = $createdAt
            scheduleReleasedBy = "Scheduler Li"
            scheduleReleaseAuditId = "AUD-STAGING-OUTSOURCING-SCHEDULE-20260614"
            scheduleReleaseTraceId = "TRACE-STAGING-OUTSOURCING-SCHEDULE-20260614"
            scheduleReleaseMessage = "Schedule release confirmed."
        } | Out-Null

    $otdLatest = Invoke-ApiJson `
        -Method "GET" `
        -Path "/api/v1/scheduling/otd-kpi-commitments/latest" `
        -Headers $headers
    if ($otdLatest.id -ne $otdCommitmentId) {
        throw "Latest OTD KPI commitment mismatch. Expected $otdCommitmentId but got $($otdLatest.id)."
    }

    $outsourcingLatest = Invoke-ApiJson `
        -Method "GET" `
        -Path "/api/v1/scheduling/outsourcing-commitments/latest" `
        -Headers $headers
    if ($outsourcingLatest.id -ne $outsourcingCommitmentId) {
        throw "Latest outsourcing commitment mismatch. Expected $outsourcingCommitmentId but got $($outsourcingLatest.id)."
    }

    $otdEvidenceCount = Invoke-PostgresScalar "SELECT COUNT(*) FROM agent_evidence_links WHERE evidence_type = 'OtdKpiCommitmentPackage' AND evidence_key = '$otdCommitmentId' AND evidence_summary LIKE '%customer-huadong-staging%';"
    $outsourcingEvidenceCount = Invoke-PostgresScalar "SELECT COUNT(*) FROM agent_evidence_links WHERE evidence_type = 'OutsourcingCommitmentPackage' AND evidence_key = '$outsourcingCommitmentId' AND evidence_summary LIKE '%product-flange-staging%';"
    $otdAuditCount = Invoke-PostgresScalar "SELECT COUNT(*) FROM audit_logs WHERE action = 'OtdKpiCommitmentPackageUpsert' AND resource_id = '$otdCommitmentId';"
    $outsourcingAuditCount = Invoke-PostgresScalar "SELECT COUNT(*) FROM audit_logs WHERE action = 'OutsourcingCommitmentUpsert' AND resource_id = '$outsourcingCommitmentId';"

    if ($otdEvidenceCount -ne "1" -or $outsourcingEvidenceCount -ne "1" -or $otdAuditCount -ne "1" -or $outsourcingAuditCount -ne "1") {
        throw "Commitment PostgreSQL evidence mismatch. OTD evidence=$otdEvidenceCount, outsourcing evidence=$outsourcingEvidenceCount, OTD audit=$otdAuditCount, outsourcing audit=$outsourcingAuditCount."
    }

    @(
        "OTD commitment id: $otdCommitmentId",
        "Outsourcing commitment id: $outsourcingCommitmentId",
        "Latest OTD commitment id: $($otdLatest.id)",
        "Latest outsourcing commitment id: $($outsourcingLatest.id)",
        "PostgreSQL OTD evidence rows: $otdEvidenceCount",
        "PostgreSQL outsourcing evidence rows: $outsourcingEvidenceCount",
        "PostgreSQL OTD audit rows: $otdAuditCount",
        "PostgreSQL outsourcing audit rows: $outsourcingAuditCount"
    )
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
    "- DockerEngineTimeoutSeconds: $DockerEngineTimeoutSeconds",
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
    if ($IncludeRescheduleProbe) {
        Invoke-AndCapture "Reschedule PostgreSQL persistence probe" { Invoke-ReschedulePersistenceProbe }
    }
    if ($IncludeCommitmentProbe) {
        Invoke-AndCapture "Commitment PostgreSQL persistence probe" { Invoke-CommitmentPersistenceProbe }
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
    Write-Host "Staging rehearsal report: $ReportPath"
}
