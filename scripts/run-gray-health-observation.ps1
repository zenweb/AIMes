param(
    [string]$ReportPath = "_docs/_reports/gray-health-observation-latest.md",
    [string]$EvidencePath = "_docs/_reports/gray-health-observation-latest.jsonl",
    [string]$BaseUrl = "http://127.0.0.1:5003",
    [string]$GrayReleaseId = "",
    [ValidateRange(1, 100000)]
    [int]$SampleCount = 3,
    [ValidateRange(0, 86400)]
    [int]$IntervalSeconds = 5,
    [ValidateRange(1, 300)]
    [int]$TimeoutSeconds = 5,
    [switch]$PlanOnly
)

$ErrorActionPreference = "Stop"
$paths = @("/live", "/ready")
$script:reportLines = @()

function Add-Line([string]$Line = "") {
    $script:reportLines += $Line
}

function Ensure-ParentDirectory([string]$Path) {
    $directory = Split-Path -Parent $Path
    if (-not [string]::IsNullOrWhiteSpace($directory)) {
        New-Item -ItemType Directory -Force -Path $directory | Out-Null
    }
}

function Write-ObservationReport([string]$Result, [int]$FailureCount, [string]$EvidenceHash = "") {
    Add-Line ""
    Add-Line "## Gate boundary"
    Add-Line ""
    Add-Line "- StrictGrayGateClosed: false"
    Add-Line "- This probe proves sampled /live and /ready availability only."
    Add-Line "- A strict gray PASS still requires an external incident source proving P0/P1 counts for the complete observation window."
    Add-Line "- Probe failures: $FailureCount"
    if (-not [string]::IsNullOrWhiteSpace($EvidenceHash)) {
        Add-Line "- Evidence SHA256: $EvidenceHash"
    }
    Add-Line "- Result: $Result"

    Ensure-ParentDirectory $ReportPath
    Set-Content -Path $ReportPath -Value $script:reportLines -Encoding UTF8
    Write-Host "Gray health observation report: $ReportPath"
}

if ([string]::IsNullOrWhiteSpace($GrayReleaseId)) {
    throw "GrayReleaseId is required."
}

Add-Line "# Gray release health observation"
Add-Line ""
Add-Line "- GeneratedAt: $(Get-Date -Format o)"
Add-Line "- GrayReleaseId: $GrayReleaseId"
Add-Line "- BaseUrl: $($BaseUrl.TrimEnd('/'))"
Add-Line "- Endpoints: $($paths -join ', ')"
Add-Line "- SampleCount: $SampleCount"
Add-Line "- IntervalSeconds: $IntervalSeconds"
Add-Line "- EvidencePath: $EvidencePath"

if ($PlanOnly) {
    Add-Line "- Mode: PLAN_ONLY"
    Write-ObservationReport "PASS" 0
    return
}

Add-Line "- Mode: EXECUTE"
Ensure-ParentDirectory $EvidencePath
Remove-Item -LiteralPath $EvidencePath -Force -ErrorAction SilentlyContinue

$failureCount = 0
$sampleRows = New-Object System.Collections.Generic.List[object]
for ($sample = 1; $sample -le $SampleCount; $sample++) {
    foreach ($path in $paths) {
        $url = "$($BaseUrl.TrimEnd('/'))$path"
        $startedAt = [DateTimeOffset]::UtcNow
        $stopwatch = [Diagnostics.Stopwatch]::StartNew()
        $statusCode = 0
        $errorMessage = ""
        $isHealthy = $false

        try {
            $response = Invoke-WebRequest `
                -Uri $url `
                -Method Get `
                -TimeoutSec $TimeoutSeconds `
                -SkipHttpErrorCheck
            $statusCode = [int]$response.StatusCode
            $isHealthy = $statusCode -ge 200 -and $statusCode -lt 300
        } catch {
            $errorMessage = $_.Exception.Message
        } finally {
            $stopwatch.Stop()
        }

        if (-not $isHealthy) {
            $failureCount++
        }

        $row = [ordered]@{
            grayReleaseId = $GrayReleaseId
            sample = $sample
            observedAt = $startedAt.ToString("o")
            endpoint = $path
            url = $url
            statusCode = $statusCode
            elapsedMilliseconds = $stopwatch.ElapsedMilliseconds
            healthy = $isHealthy
            error = $errorMessage
        }
        $sampleRows.Add([pscustomobject]$row)
        $row | ConvertTo-Json -Compress | Add-Content -Path $EvidencePath -Encoding UTF8
    }

    if ($sample -lt $SampleCount -and $IntervalSeconds -gt 0) {
        Start-Sleep -Seconds $IntervalSeconds
    }
}

Add-Line ""
Add-Line "## Samples"
Add-Line ""
Add-Line "| Sample | Endpoint | Status | Latency ms | Healthy |"
Add-Line "| ---: | --- | ---: | ---: | --- |"
foreach ($row in $sampleRows) {
    Add-Line "| $($row.sample) | $($row.endpoint) | $($row.statusCode) | $($row.elapsedMilliseconds) | $($row.healthy.ToString().ToLowerInvariant()) |"
}

$evidenceHash = (Get-FileHash -Algorithm SHA256 -Path $EvidencePath).Hash.ToLowerInvariant()
$result = if ($failureCount -eq 0) { "PASS" } else { "FAIL" }
Write-ObservationReport $result $failureCount $evidenceHash

if ($result -ne "PASS") {
    throw "Gray health observation probe failed. See $ReportPath."
}
