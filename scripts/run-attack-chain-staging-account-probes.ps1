param(
    [string]$ReportPath = "_docs/_reports/attack-chain-staging-account-probes-latest.md",
    [string]$ApiBaseUrl = "http://localhost:5003",
    [string]$AdminUsername = "attack_chain_admin",
    [string]$AdminPassword,
    [string]$OperatorUsername = "attack_chain_operator",
    [string]$OperatorPassword
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($AdminPassword) -or [string]::IsNullOrWhiteSpace($OperatorPassword)) {
    throw "AdminPassword and OperatorPassword are required. They are used for probes but are never written to the report."
}

function Add-Line([string]$Line = "") {
    $script:reportLines += $Line
}

function Invoke-Login([string]$Username, [string]$Password) {
    try {
        $response = Invoke-RestMethod `
            -Uri "$ApiBaseUrl/api/v1/auth/login" `
            -Method Post `
            -ContentType "application/json" `
            -Body (@{ username = $Username; password = $Password } | ConvertTo-Json -Compress) `
            -TimeoutSec 10

        return [pscustomobject]@{
            Status             = 200
            Token              = $response.token
            Role               = $response.role
            MustChangePassword = $response.mustChangePassword
            HasToken           = -not [string]::IsNullOrWhiteSpace($response.token)
        }
    } catch {
        $response = $_.Exception.Response
        return [pscustomobject]@{
            Status             = if ($response) { [int]$response.StatusCode } else { -1 }
            Token              = ""
            Role               = ""
            MustChangePassword = $null
            HasToken           = $false
        }
    }
}

function Invoke-AuthorizedProbe(
    [string]$Name,
    [string]$Method,
    [string]$Path,
    [string]$Token,
    [int]$ExpectedStatusCode,
    [object]$Body = $null
) {
    $content = ""
    $statusCode = -1

    try {
        $parameters = @{
            Uri             = "$ApiBaseUrl$Path"
            Method          = $Method
            Headers         = @{ Authorization = "Bearer $Token" }
            UseBasicParsing = $true
            TimeoutSec      = 10
        }
        if ($null -ne $Body) {
            $parameters.Body = $Body | ConvertTo-Json -Compress
            $parameters.ContentType = "application/json"
        }

        $response = Invoke-WebRequest @parameters
        $statusCode = [int]$response.StatusCode
        $content = [string]$response.Content
    } catch {
        $response = $_.Exception.Response
        if ($response) {
            $statusCode = [int]$response.StatusCode
            try {
                $reader = [System.IO.StreamReader]::new($response.GetResponseStream())
                $content = $reader.ReadToEnd()
                $reader.Dispose()
            } catch {
                $content = ""
            }
        } else {
            $content = $_.Exception.Message
        }
    }

    $preview = $content.Trim()
    if ($preview.Length -gt 180) {
        $preview = $preview.Substring(0, 180)
    }

    [pscustomobject]@{
        Name               = $Name
        Method             = $Method
        Path               = $Path
        ExpectedStatusCode = $ExpectedStatusCode
        ActualStatusCode   = $statusCode
        BodyPreview        = $preview
        Passed             = $statusCode -eq $ExpectedStatusCode
    }
}

$reportDirectory = Split-Path -Parent $ReportPath
if (-not [string]::IsNullOrWhiteSpace($reportDirectory)) {
    New-Item -ItemType Directory -Force -Path $reportDirectory | Out-Null
}

$generatedAt = Get-Date -Format o
$adminLogin = Invoke-Login $AdminUsername $AdminPassword
$operatorLogin = Invoke-Login $OperatorUsername $OperatorPassword

$probes = @()
if ($adminLogin.HasToken) {
    $probes += Invoke-AuthorizedProbe "Admin token reads admin users" "GET" "/api/v1/admin/users" $adminLogin.Token 200
}
if ($operatorLogin.HasToken) {
    $probes += Invoke-AuthorizedProbe "Operator token rejected from admin users" "GET" "/api/v1/admin/users" $operatorLogin.Token 403
    $probes += Invoke-AuthorizedProbe "Operator token reads equipment" "GET" "/api/v1/equipment" $operatorLogin.Token 200
    $probes += Invoke-AuthorizedProbe "Operator token posts agent recommend validation path" "POST" "/api/v1/scheduling/agent/recommend" $operatorLogin.Token 400 @{ workOrderId = "wo-001"; objective = "attack-chain-manual-probe" }
}

$violations = New-Object System.Collections.Generic.List[string]
if (-not $adminLogin.HasToken -or $adminLogin.Status -ne 200 -or $adminLogin.Role -ne "Admin" -or $adminLogin.MustChangePassword -ne $false) {
    $violations.Add("Admin login did not produce an active Admin token with MustChangePassword=false.")
}
if (-not $operatorLogin.HasToken -or $operatorLogin.Status -ne 200 -or $operatorLogin.Role -ne "Operator" -or $operatorLogin.MustChangePassword -ne $false) {
    $violations.Add("Operator login did not produce an active Operator token with MustChangePassword=false.")
}
foreach ($probe in $probes | Where-Object { -not $_.Passed }) {
    $violations.Add("$($probe.Name) expected $($probe.ExpectedStatusCode), actual $($probe.ActualStatusCode).")
}

$script:reportLines = @()
Add-Line "# Attack Chain staging account probes"
Add-Line ""
Add-Line "- GeneratedAt: $generatedAt"
Add-Line "- Scope: account-backed staging probes for human Attack Chain A/B/C review."
Add-Line "- Boundary: this report is machine-collected support evidence. It does not replace the human verifier, VerifiedAt, per-chain evidence, or security signoff."
Add-Line "- Password handling: passwords are supplied by the caller and are not written to this report."
Add-Line ""
Add-Line "## Prepared accounts"
Add-Line ""
Add-Line "| Username | Expected role | Login status | Actual role | MustChangePassword | HasToken |"
Add-Line "| --- | --- | --- | --- | --- | --- |"
Add-Line "| $AdminUsername | Admin | $($adminLogin.Status) | $($adminLogin.Role) | $($adminLogin.MustChangePassword) | $($adminLogin.HasToken) |"
Add-Line "| $OperatorUsername | Operator | $($operatorLogin.Status) | $($operatorLogin.Role) | $($operatorLogin.MustChangePassword) | $($operatorLogin.HasToken) |"
Add-Line ""
Add-Line "## Probes"
Add-Line ""
Add-Line "| Probe | Method | Path | Expected | Actual | Evidence |"
Add-Line "| --- | --- | --- | --- | --- | --- |"
foreach ($probe in $probes) {
    $evidence = if ([string]::IsNullOrWhiteSpace($probe.BodyPreview)) { "no response body" } else { $probe.BodyPreview.Replace("|", "\|") }
    Add-Line ("| {0} | {1} | {2} | {3} | {4} | {5} |" -f $probe.Name, $probe.Method, $probe.Path, $probe.ExpectedStatusCode, $probe.ActualStatusCode, $evidence)
}
Add-Line ""
Add-Line "## Attack Chain mapping"
Add-Line ""
Add-Line "- Attack Chain A support: real staging admin and operator identities authenticate; admin-only endpoint rejects operator."
Add-Line "- Attack Chain B support: report does not persist passwords; login tokens are not written to the evidence file."
Add-Line "- Attack Chain C support: account-backed probes run against current staging API and PostgreSQL state."
Add-Line ""
Add-Line "## Remaining human checks"
Add-Line ""
Add-Line "- Manually review Agent cross-domain action policy using the automated role-matrix evidence and, if needed, a valid existing Agent decision."
Add-Line "- Run `scripts/run-attack-chain-verification.ps1` with human verifier, timestamp, and A/B/C evidence."
Add-Line "- Rotate or remove staging probe accounts after verification."

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
        Add-Line "- $violation"
    }
}

Set-Content -Path $ReportPath -Value $script:reportLines -Encoding UTF8
Write-Host "Attack Chain staging account probes report: $ReportPath"

if ($violations.Count -ne 0) {
    throw "Attack Chain staging account probes failed. See $ReportPath."
}
