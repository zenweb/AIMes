param(
    [string]$ReportPath = "_docs/_reports/attack-chain-staging-audit-redaction-probe-latest.md",
    [string]$ApiBaseUrl = "http://localhost:5003",
    [string]$PostgresContainer = "aimes-pg",
    [string]$PostgresDatabase = "mes",
    [string]$PostgresUser = "postgres",
    [string]$AdminUsername = "attack_chain_admin",
    [string]$AdminPassword,
    [string]$ProbeUsername = "attack_chain_audit_probe_20260611",
    [string]$ProbePassword
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($AdminPassword) -or [string]::IsNullOrWhiteSpace($ProbePassword)) {
    throw "AdminPassword and ProbePassword are required. They are used for probes but are never written to the report."
}

function Add-Line([string]$Line = "") {
    $script:reportLines += $Line
}

function ConvertTo-SqlLiteral([string]$Value) {
    return "'" + $Value.Replace("'", "''") + "'"
}

function Invoke-Login([string]$Username, [string]$Password) {
    $response = Invoke-RestMethod `
        -Uri "$ApiBaseUrl/api/v1/auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body (@{ username = $Username; password = $Password } | ConvertTo-Json -Compress) `
        -TimeoutSec 10
    return $response.token
}

function Invoke-PostgresQuery([string]$Sql) {
    $output = docker exec $PostgresContainer psql -U $PostgresUser -d $PostgresDatabase -P pager=off -c $Sql 2>&1
    $exitCode = if ($null -eq $LASTEXITCODE) { 0 } else { $LASTEXITCODE }
    if ($exitCode -ne 0) {
        throw "PostgreSQL query failed with exit code $exitCode. Output: $output"
    }
    return @($output | ForEach-Object { [string]$_ })
}

function Invoke-PostgresScalar([string]$Sql) {
    $output = docker exec $PostgresContainer psql -U $PostgresUser -d $PostgresDatabase -t -A -c $Sql 2>&1
    $exitCode = if ($null -eq $LASTEXITCODE) { 0 } else { $LASTEXITCODE }
    if ($exitCode -ne 0) {
        throw "PostgreSQL scalar query failed with exit code $exitCode. Output: $output"
    }
    return ($output | Select-Object -First 1).Trim()
}

$reportDirectory = Split-Path -Parent $ReportPath
if (-not [string]::IsNullOrWhiteSpace($reportDirectory)) {
    New-Item -ItemType Directory -Force -Path $reportDirectory | Out-Null
}

$generatedAt = Get-Date -Format o
$adminToken = Invoke-Login $AdminUsername $AdminPassword
$probeUsernameLiteral = ConvertTo-SqlLiteral $ProbeUsername
$existingProbeUserCount = Invoke-PostgresScalar "select count(*) from system_users where username = $probeUsernameLiteral;"
$body = @{
    username    = $ProbeUsername
    password    = $ProbePassword
    displayName = "Attack Chain Audit Probe"
    role        = "Operator"
}

$createStatus = "SKIPPED_EXISTING"
if ($existingProbeUserCount -eq "0") {
    try {
        $response = Invoke-WebRequest `
            -Uri "$ApiBaseUrl/api/v1/admin/users" `
            -Method Post `
            -Headers @{ Authorization = "Bearer $adminToken"; "X-Initiated-By" = "User" } `
            -ContentType "application/json" `
            -Body ($body | ConvertTo-Json -Compress) `
            -UseBasicParsing `
            -TimeoutSec 10
        $createStatus = [int]$response.StatusCode
    } catch {
        $response = $_.Exception.Response
        $createStatus = if ($response) { [int]$response.StatusCode } else { -1 }
    }
}

$passwordLiteral = ConvertTo-SqlLiteral $ProbePassword
$auditSql = @"
select id,
       action,
       resource,
       new_values,
       (new_values like '%***REDACTED***%') as has_redacted,
       (new_values like '%' || $passwordLiteral || '%') as has_plain_password
from audit_logs
where resource='admin'
  and action='POST'
  and new_values like '%' || $probeUsernameLiteral || '%'
order by created_at desc
limit 1;
"@
$auditRows = Invoke-PostgresQuery $auditSql
$auditText = $auditRows -join [Environment]::NewLine

$hasRedacted = $auditText -match '\|\s*t\s*\|\s*f\s*$' -or ($auditText.Contains(" t ") -and $auditText.Contains(" f"))
$violations = New-Object System.Collections.Generic.List[string]
if ($createStatus -ne 201 -and $createStatus -ne "SKIPPED_EXISTING") {
    $violations.Add("Expected user creation to return 201 or be skipped because the probe user already exists. Actual: $createStatus.")
}
if (-not $auditText.Contains("***REDACTED***")) {
    $violations.Add("Audit log did not contain the redaction marker.")
}
if ($auditText.Contains($ProbePassword)) {
    $violations.Add("Audit log output contains the plain probe password.")
}
if (-not $hasRedacted) {
    $violations.Add("Audit query did not show has_redacted=true and has_plain_password=false.")
}

$script:reportLines = @()
Add-Line "# Attack Chain staging audit redaction probe"
Add-Line ""
Add-Line "- GeneratedAt: $generatedAt"
Add-Line "- Scope: account-backed staging audit redaction probe for Attack Chain B human review."
Add-Line "- Boundary: this report is machine-collected support evidence. It does not replace the human verifier, VerifiedAt, per-chain evidence, or security signoff."
Add-Line "- Password handling: passwords are supplied by the caller and are not written to this report."
Add-Line ""
Add-Line "## Probe"
Add-Line ""
Add-Line "- Authenticated as: $AdminUsername"
Add-Line "- Operation: POST /api/v1/admin/users"
Add-Line "- Created username: $ProbeUsername"
Add-Line "- Existing probe user count before create: $existingProbeUserCount"
Add-Line "- HTTP status: $createStatus"
Add-Line ""
Add-Line "## Audit verification"
Add-Line ""
Add-Line '```text'
Add-Line "select id, action, resource, new_values,"
Add-Line "       (new_values like '%***REDACTED***%') as has_redacted,"
Add-Line "       (new_values like '%<plain-password>%') as has_plain_password"
Add-Line "from audit_logs"
Add-Line "where resource='admin'"
Add-Line "  and action='POST'"
Add-Line "  and new_values like '%$ProbeUsername%'"
Add-Line "order by created_at desc"
Add-Line "limit 1;"
Add-Line '```'
Add-Line ""
Add-Line "Observed result:"
Add-Line ""
Add-Line '```text'
$auditRows | ForEach-Object { Add-Line $_ }
Add-Line '```'
Add-Line ""
Add-Line "## Attack Chain mapping"
Add-Line ""
Add-Line "- Attack Chain B support: admin-created initial password is redacted in audit payloads."
Add-Line "- Attack Chain B support: the exact plain password used for the probe was not found in audit_logs.new_values."

if ($violations.Count -eq 0) {
    Add-Line ""
    Add-Line "## Result"
    Add-Line ""
    Add-Line "- Result: PREPARED_ONLY"
    Add-Line "- Remaining: human verifier must inspect and accept this evidence before Attack Chain B can be marked PASS."
} else {
    Add-Line ""
    Add-Line "## Result"
    Add-Line ""
    Add-Line "- Result: FAIL"
    Add-Line ""
    Add-Line "## Violations"
    Add-Line ""
    foreach ($violation in $violations) {
        Add-Line "- $violation"
    }
}

Set-Content -Path $ReportPath -Value $script:reportLines -Encoding UTF8
Write-Host "Attack Chain staging audit redaction probe report: $ReportPath"

if ($violations.Count -ne 0) {
    throw "Attack Chain staging audit redaction probe failed. See $ReportPath."
}
