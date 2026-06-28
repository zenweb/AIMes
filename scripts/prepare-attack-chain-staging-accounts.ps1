param(
    [string]$ReportPath = "_docs/_reports/attack-chain-staging-accounts-latest.md",
    [string]$PostgresContainer = "aimes-pg",
    [string]$PostgresDatabase = "mes",
    [string]$PostgresUser = "postgres",
    [string]$AdminUsername = "attack_chain_admin",
    [string]$OperatorUsername = "attack_chain_operator",
    [string]$ProbeUsername = "attack_chain_audit_probe_20260611",
    [string]$AdminPassword = "",
    [string]$OperatorPassword = "",
    [switch]$Apply,
    [switch]$Remove,
    [switch]$IncludeAuditProbe
)

$ErrorActionPreference = "Stop"

if ($Apply -and $Remove) {
    throw "Use either -Apply or -Remove, not both."
}

function Add-Line([string]$Line = "") {
    $script:reportLines += $Line
}

function New-RandomPassword() {
    $bytes = New-Object byte[] 24
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    try {
        $rng.GetBytes($bytes)
    } finally {
        $rng.Dispose()
    }
    return [Convert]::ToBase64String($bytes)
}

function New-PasswordHash([string]$Password) {
    $saltSize = 16
    $hashSize = 32
    $iterations = 100000
    $salt = New-Object byte[] $saltSize
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    try {
        $rng.GetBytes($salt)
    } finally {
        $rng.Dispose()
    }
    $deriveBytes = [System.Security.Cryptography.Rfc2898DeriveBytes]::new(
        $Password,
        $salt,
        $iterations,
        [System.Security.Cryptography.HashAlgorithmName]::SHA256)
    try {
        $hash = $deriveBytes.GetBytes($hashSize)
    } finally {
        $deriveBytes.Dispose()
    }
    return "{0}.{1}" -f [Convert]::ToBase64String($salt), [Convert]::ToBase64String($hash)
}

function Invoke-PostgresScalar([string]$Sql) {
    $output = docker exec $PostgresContainer psql -U $PostgresUser -d $PostgresDatabase -t -A -c $Sql 2>&1
    $exitCode = if ($null -eq $LASTEXITCODE) { 0 } else { $LASTEXITCODE }
    if ($exitCode -ne 0) {
        throw "PostgreSQL command failed with exit code $exitCode. Output: $output"
    }
    return ($output | Select-Object -First 1).Trim()
}

function Invoke-PostgresCommand([string]$Sql) {
    $output = docker exec $PostgresContainer psql -U $PostgresUser -d $PostgresDatabase -v ON_ERROR_STOP=1 -c $Sql 2>&1
    $exitCode = if ($null -eq $LASTEXITCODE) { 0 } else { $LASTEXITCODE }
    if ($exitCode -ne 0) {
        throw "PostgreSQL command failed with exit code $exitCode. Output: $output"
    }
    return $output
}

function ConvertTo-SqlLiteral([string]$Value) {
    return "'" + $Value.Replace("'", "''") + "'"
}

$reportDirectory = Split-Path -Parent $ReportPath
if (-not [string]::IsNullOrWhiteSpace($reportDirectory)) {
    New-Item -ItemType Directory -Force -Path $reportDirectory | Out-Null
}

$generatedAt = Get-Date -Format o
$targetUsernames = New-Object System.Collections.Generic.List[string]
$targetUsernames.Add($AdminUsername)
$targetUsernames.Add($OperatorUsername)
if ($IncludeAuditProbe) {
    $targetUsernames.Add($ProbeUsername)
}

$adminPasswordWasGenerated = [string]::IsNullOrWhiteSpace($AdminPassword)
$operatorPasswordWasGenerated = [string]::IsNullOrWhiteSpace($OperatorPassword)
if ($adminPasswordWasGenerated) {
    $AdminPassword = New-RandomPassword
}
if ($operatorPasswordWasGenerated) {
    $OperatorPassword = New-RandomPassword
}

$adminHash = New-PasswordHash $AdminPassword
$operatorHash = New-PasswordHash $OperatorPassword
$beforeCount = Invoke-PostgresScalar "select count(*) from system_users;"
$action = "DRY_RUN"
$commandOutput = @()

if ($Remove) {
    $action = "REMOVE"
    $deleteTargets = ($targetUsernames | ForEach-Object { ConvertTo-SqlLiteral $_ }) -join ", "
    $deleteSql = @"
delete from system_users
where username in ($deleteTargets);
"@
    $commandOutput = Invoke-PostgresCommand $deleteSql
} elseif ($Apply) {
    $action = "APPLY"
    $now = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffffffZ")
    $upsertSql = @"
insert into system_users (id, username, display_name, role, is_active, created_at, password_hash, must_change_password)
values
  ($(ConvertTo-SqlLiteral "attack-chain-admin"), $(ConvertTo-SqlLiteral $AdminUsername), 'Attack Chain Admin', 'Admin', true, $(ConvertTo-SqlLiteral $now)::timestamptz, $(ConvertTo-SqlLiteral $adminHash), true),
  ($(ConvertTo-SqlLiteral "attack-chain-operator"), $(ConvertTo-SqlLiteral $OperatorUsername), 'Attack Chain Operator', 'Operator', true, $(ConvertTo-SqlLiteral $now)::timestamptz, $(ConvertTo-SqlLiteral $operatorHash), true)
on conflict (username) do update
set display_name = excluded.display_name,
    role = excluded.role,
    is_active = true,
    password_hash = excluded.password_hash,
    must_change_password = true;
"@
    $commandOutput = Invoke-PostgresCommand $upsertSql
}

$afterCount = Invoke-PostgresScalar "select count(*) from system_users;"
$targetSqlList = ($targetUsernames | ForEach-Object { ConvertTo-SqlLiteral $_ }) -join ", "
$accountRows = docker exec $PostgresContainer psql -U $PostgresUser -d $PostgresDatabase -P pager=off -c "select username, role, is_active, must_change_password from system_users where username in ($targetSqlList) order by username;" 2>&1

$script:reportLines = @()
Add-Line "# Attack Chain staging account preparation"
Add-Line ""
Add-Line "- GeneratedAt: $generatedAt"
Add-Line "- Action: $action"
Add-Line "- PostgreSQL container: $PostgresContainer"
Add-Line "- Database: $PostgresDatabase"
Add-Line "- Boundary: this script prepares optional staging accounts for human Attack Chain verification. It does not perform or sign the manual verification gate."
Add-Line ""
Add-Line "## Requested accounts"
Add-Line ""
Add-Line "| Username | Role | Password source |"
Add-Line "| --- | --- | --- |"
Add-Line "| $AdminUsername | Admin | $(if ($adminPasswordWasGenerated) { "generated, not written to report" } else { "provided by caller, not written to report" }) |"
Add-Line "| $OperatorUsername | Operator | $(if ($operatorPasswordWasGenerated) { "generated, not written to report" } else { "provided by caller, not written to report" }) |"
if ($IncludeAuditProbe) {
    Add-Line "| $ProbeUsername | Operator | existing audit probe account; password not needed for cleanup |"
}
Add-Line ""
Add-Line "## Database counts"
Add-Line ""
Add-Line "- Before system_users count: $beforeCount"
Add-Line "- After system_users count: $afterCount"
Add-Line ""
Add-Line "## Account rows"
Add-Line ""
Add-Line '```text'
$accountRows | ForEach-Object { Add-Line ([string]$_) }
Add-Line '```'
if ($commandOutput.Count -gt 0) {
    Add-Line ""
    Add-Line "## Command output"
    Add-Line ""
    Add-Line '```text'
    $commandOutput | ForEach-Object { Add-Line ([string]$_) }
    Add-Line '```'
}
Add-Line ""
Add-Line "## Result"
Add-Line ""
if ($Apply) {
    Add-Line "- Result: APPLIED"
    Add-Line "- Next: use the provided passwords from the caller context to run manual Attack Chain A/B/C verification, then rotate or remove these accounts."
} elseif ($Remove) {
    Add-Line "- Result: REMOVED"
    Add-Line "- Removed usernames: $($targetUsernames -join ', ')"
} else {
    Add-Line "- Result: DRY_RUN"
    Add-Line "- Target usernames: $($targetUsernames -join ', ')"
    Add-Line "- Next: rerun with -Apply and explicit passwords stored outside the report, or with -Remove after human verification is complete."
}

Set-Content -Path $ReportPath -Value $script:reportLines -Encoding UTF8
Write-Host "Attack Chain staging account preparation report: $ReportPath"

if (-not $Apply -and -not $Remove) {
    Write-Host "Dry run only. Re-run with -Apply to write staging accounts, or -Remove to delete the named accounts."
}
