param(
    [string]$ReportPath = "_docs/_reports/attack-chain-staging-transcript-latest.md",
    [string]$ApiBaseUrl = "http://localhost:5003",
    [string]$StagingReportPath = "_docs/_reports/staging-rehearsal-20260611-docker-restored.md",
    [string]$PostgresContainer = "aimes-pg",
    [string]$PostgresDatabase = "mes",
    [string]$PostgresUser = "postgres"
)

$ErrorActionPreference = "Stop"

function Add-Line([string]$Line = "") {
    $script:reportLines += $Line
}

function Invoke-HttpProbe(
    [string]$Name,
    [string]$Method,
    [string]$Path,
    [Nullable[int]]$ExpectedStatusCode,
    [object]$Body = $null,
    [hashtable]$Headers = @{},
    [string]$ExpectedAccessControlAllowOrigin = ""
) {
    $uri = "$ApiBaseUrl$Path"
    $responseBody = ""
    $statusCode = -1
    $allowOrigin = $null
    $wwwAuthenticate = $null

    try {
        $parameters = @{
            Uri             = $uri
            Method          = $Method
            UseBasicParsing = $true
            TimeoutSec      = 10
            Headers         = $Headers
        }
        if ($null -ne $Body) {
            $parameters.Body = $Body | ConvertTo-Json -Compress
            $parameters.ContentType = "application/json"
        }

        $response = Invoke-WebRequest @parameters
        $statusCode = [int]$response.StatusCode
        $responseBody = [string]$response.Content
        $allowOrigin = $response.Headers["Access-Control-Allow-Origin"]
        $wwwAuthenticate = $response.Headers["WWW-Authenticate"]
    } catch {
        $response = $_.Exception.Response
        if ($response) {
            $statusCode = [int]$response.StatusCode
            $allowOrigin = $response.Headers["Access-Control-Allow-Origin"]
            $wwwAuthenticate = $response.Headers["WWW-Authenticate"]
            try {
                $reader = [System.IO.StreamReader]::new($response.GetResponseStream())
                $responseBody = $reader.ReadToEnd()
                $reader.Dispose()
            } catch {
                $responseBody = ""
            }
        } else {
            $responseBody = $_.Exception.Message
        }
    }

    $bodyPreview = $responseBody.Trim()
    if ($bodyPreview.Length -gt 160) {
        $bodyPreview = $bodyPreview.Substring(0, 160)
    }

    $passed = $true
    $expectedStatusCodeDisplay = if ($null -ne $ExpectedStatusCode) { [int]$ExpectedStatusCode } else { "" }

    if ($null -ne $ExpectedStatusCode -and $statusCode -ne [int]$ExpectedStatusCode) {
        $passed = $false
    }
    if ($ExpectedAccessControlAllowOrigin -eq "__ABSENT__" -and -not [string]::IsNullOrWhiteSpace($allowOrigin)) {
        $passed = $false
    } elseif (-not [string]::IsNullOrWhiteSpace($ExpectedAccessControlAllowOrigin) `
        -and $ExpectedAccessControlAllowOrigin -ne "__ABSENT__" `
        -and $allowOrigin -ne $ExpectedAccessControlAllowOrigin) {
        $passed = $false
    }

    [pscustomobject]@{
        Name                       = $Name
        Method                     = $Method
        Path                       = $Path
        ExpectedStatusCode         = $expectedStatusCodeDisplay
        ActualStatusCode           = $statusCode
        BodyPreview                = $bodyPreview
        AccessControlAllowOrigin   = $allowOrigin
        WWWAuthenticate            = $wwwAuthenticate
        Passed                     = $passed
    }
}

function Get-SystemUserCount() {
    $output = docker exec $PostgresContainer psql -U $PostgresUser -d $PostgresDatabase -t -A -c "select count(*) from system_users;" 2>&1
    $exitCode = if ($null -eq $LASTEXITCODE) { 0 } else { $LASTEXITCODE }
    if ($exitCode -ne 0) {
        throw "Unable to query system_users count from $PostgresContainer/$PostgresDatabase. Exit code: $exitCode. Output: $output"
    }

    return ($output | Select-Object -First 1).Trim()
}

$reportDirectory = Split-Path -Parent $ReportPath
if (-not [string]::IsNullOrWhiteSpace($reportDirectory)) {
    New-Item -ItemType Directory -Force -Path $reportDirectory | Out-Null
}

$generatedAt = Get-Date -Format o
$systemUserCount = Get-SystemUserCount
$probes = @()
$probes += Invoke-HttpProbe "live public probe" "GET" "/live" 200
$probes += Invoke-HttpProbe "ready public probe" "GET" "/ready" 200
$probes += Invoke-HttpProbe "secured health anonymous rejection" "GET" "/healthz/secured" 401
$probes += Invoke-HttpProbe "equipment anonymous rejection" "GET" "/api/v1/equipment" 401
$probes += Invoke-HttpProbe "admin users anonymous rejection" "GET" "/api/v1/admin/users" 401
$probes += Invoke-HttpProbe "scheduling agent anonymous rejection" "POST" "/api/v1/scheduling/agent/recommend" 401 @{ workOrderId = "wo-001"; objective = "attack-chain-probe" }
$probes += Invoke-HttpProbe "equipment malformed bearer rejection" "GET" "/api/v1/equipment" 401 $null @{ Authorization = "Bearer malformed-token" }
$probes += Invoke-HttpProbe "invalid login no token" "POST" "/api/v1/auth/login" 401 @{ username = "admin"; password = "wrong-password-for-attack-chain-probe" }
$probes += Invoke-HttpProbe "CORS disallowed origin preflight" "OPTIONS" "/api/v1/equipment" 204 $null @{ Origin = "https://evil.example.invalid"; "Access-Control-Request-Method" = "GET" } "__ABSENT__"

$violations = @($probes | Where-Object { -not $_.Passed })

$script:reportLines = @()
Add-Line "# Attack Chain staging transcript"
Add-Line ""
Add-Line "- GeneratedAt: $generatedAt"
Add-Line "- Scope: non-mutating staging HTTP probes for Attack Chain A/B/C human review."
Add-Line "- API base URL: $ApiBaseUrl"
Add-Line "- Staging evidence source: $StagingReportPath"
Add-Line "- Boundary: this transcript is machine-collected support evidence only. It does not replace the required human verifier, VerifiedAt, per-chain manual evidence, or security signoff."
Add-Line ""
Add-Line "## Staging identity precheck"
Add-Line ""
Add-Line '```text'
Add-Line "select count(*) from system_users;"
Add-Line $systemUserCount
Add-Line '```'
Add-Line ""
if ($systemUserCount -eq "0") {
    Add-Line "Because the current staging database has no `system_users`, this transcript does not prove valid-login, low-privilege-login, or audit-redaction flows against a real staging account. Those remain human verification tasks."
} else {
    Add-Line "The current staging database has $systemUserCount system user(s). This transcript still does not replace human low-privilege/admin verification, but account-backed manual checks can proceed."
}
Add-Line ""
Add-Line "## HTTP probes"
Add-Line ""
Add-Line "| Probe | Method | Path | Expected | Actual | Evidence |"
Add-Line "| --- | --- | --- | --- | --- | --- |"
foreach ($probe in $probes) {
    $evidence = if ([string]::IsNullOrWhiteSpace($probe.BodyPreview)) { "no response body" } else { $probe.BodyPreview.Replace("|", "\|") }
    if ($probe.Name -eq "invalid login no token" -and [string]::IsNullOrWhiteSpace($probe.BodyPreview)) {
        $evidence = "no response body, no token payload"
    }
    if ($probe.Name -eq "CORS disallowed origin preflight") {
        $evidence = "Access-Control-Allow-Origin absent for https://evil.example.invalid"
    }
    $row = "| {0} | {1} | {2} | {3} | {4} | {5} |" -f $probe.Name, $probe.Method, $probe.Path, $probe.ExpectedStatusCode, $probe.ActualStatusCode, $evidence
    Add-Line -Line $row
}
Add-Line ""
Add-Line "## Attack Chain mapping"
Add-Line ""
Add-Line "- Attack Chain A support: protected API/admin/agent endpoints reject anonymous or malformed bearer requests."
Add-Line "- Attack Chain B support: invalid login does not return credential/token material."
Add-Line "- Attack Chain C support: disallowed Origin is not granted `Access-Control-Allow-Origin`; `/live` and `/ready` remain intentionally public."
Add-Line ""
Add-Line "## Remaining human checks"
Add-Line ""
Add-Line "- Create or use a real low-privilege staging account and confirm admin-only and cross-domain Agent actions are forbidden."
Add-Line "- Create or use a real admin staging account and confirm authorized admin flows work as intended."
Add-Line "- Inspect representative audit/log/export samples after a controlled user-management operation and confirm credential material is redacted or hashed."
Add-Line "- Record verifier, timestamp, and dated evidence in `scripts/run-attack-chain-verification.ps1`."

if ($violations.Count -eq 0) {
    Add-Line ""
    Add-Line "Result: PREPARED_ONLY"
} else {
    Add-Line ""
    Add-Line "Result: FAIL"
    Add-Line ""
    Add-Line "## Violations"
    Add-Line ""
    foreach ($violation in $violations) {
        Add-Line "- $($violation.Name): expected $($violation.ExpectedStatusCode), actual $($violation.ActualStatusCode)."
    }
}

Set-Content -Path $ReportPath -Value $script:reportLines -Encoding UTF8
Write-Host "Attack Chain staging transcript report: $ReportPath"

if ($violations.Count -gt 0) {
    throw "Attack Chain staging transcript probes failed. See $ReportPath."
}
