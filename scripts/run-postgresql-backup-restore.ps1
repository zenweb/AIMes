param(
    [string]$ReportPath = "_docs/_reports/postgresql-backup-restore-latest.md",
    [string]$SourceContainer = "aimes-pg",
    [string]$Database = "mes",
    [string]$User = "postgres",
    [string]$Password = "postgres",
    [string]$RestoreImage = "postgres:16-alpine",
    [switch]$PlanOnly,
    [switch]$KeepRestoreContainer
)

$ErrorActionPreference = "Stop"
$script:reportLines = @()
$script:restoreContainer = ""
$script:sourceDumpPath = ""
$script:hostDumpPath = ""
$script:workDirectory = ""
$result = "FAIL"
$failure = ""

function Add-Line([string]$Line = "") {
    $script:reportLines += $Line
}

function Invoke-Docker([string[]]$Arguments) {
    $output = & docker @Arguments 2>&1
    $exitCode = if ($null -eq $LASTEXITCODE) { 0 } else { $LASTEXITCODE }
    $lines = @($output | ForEach-Object { [string]$_ })
    if ($exitCode -ne 0) {
        $command = $Arguments -join " "
        $detail = ($lines -join "`n").Trim()
        throw "Docker command failed (exit $exitCode): docker $command`n$detail"
    }

    return $lines
}

function Get-Scalar([string]$Container, [string]$DatabaseName, [string]$Sql) {
    $lines = Invoke-Docker @(
        "exec",
        "-e",
        "PGPASSWORD=$Password",
        $Container,
        "psql",
        "-U",
        $User,
        "-d",
        $DatabaseName,
        "-tAc",
        $Sql
    )
    return ($lines -join "`n").Trim()
}

function Write-Report() {
    $reportDirectory = Split-Path -Parent $ReportPath
    if (-not [string]::IsNullOrWhiteSpace($reportDirectory)) {
        New-Item -ItemType Directory -Force -Path $reportDirectory | Out-Null
    }

    Add-Line ""
    Add-Line "- Result: $result"
    if (-not [string]::IsNullOrWhiteSpace($failure)) {
        Add-Line "- Failure: $failure"
    }

    Set-Content -Path $ReportPath -Value $script:reportLines -Encoding UTF8
    Write-Host "PostgreSQL backup/restore report: $ReportPath"
}

function Remove-TemporaryResources() {
    if (-not [string]::IsNullOrWhiteSpace($script:restoreContainer) -and -not $KeepRestoreContainer) {
        try {
            & docker rm -f $script:restoreContainer 2>&1 | Out-Null
        } catch {
            Add-Line "- Cleanup warning: restore container could not be removed: $($_.Exception.Message)"
        }
    }

    if (-not [string]::IsNullOrWhiteSpace($script:sourceDumpPath)) {
        try {
            & docker exec $SourceContainer rm -f $script:sourceDumpPath 2>&1 | Out-Null
        } catch {
            Add-Line "- Cleanup warning: source dump could not be removed: $($_.Exception.Message)"
        }
    }

    if (-not [string]::IsNullOrWhiteSpace($script:workDirectory) -and (Test-Path $script:workDirectory)) {
        Remove-Item -LiteralPath $script:workDirectory -Recurse -Force -ErrorAction SilentlyContinue
    }
}

Add-Line "# PostgreSQL backup and isolated restore"
Add-Line ""
Add-Line "- GeneratedAt: $(Get-Date -Format o)"
Add-Line "- SourceContainer: $SourceContainer"
Add-Line "- Database: $Database"
Add-Line "- RestoreImage: $RestoreImage"
Add-Line "- Existing data volume is never modified by this check: true"

try {
    if ($PlanOnly) {
        Add-Line "- Mode: PLAN_ONLY"
        Add-Line ""
        Add-Line "## Planned safeguards"
        Add-Line ""
        Add-Line "- Create a custom-format pg_dump from the source container."
        Add-Line "- Restore into a disposable PostgreSQL container and database."
        Add-Line "- Compare table, migration, user, and audit row counts."
        Add-Line "- Remove the disposable container and dump in finally cleanup."
        $result = "PASS"
        return
    }

    Add-Line "- Mode: EXECUTE"
    Invoke-Docker @("inspect", $SourceContainer) | Out-Null
    $sourceRunning = (Invoke-Docker @("inspect", "--format", "{{.State.Running}}", $SourceContainer) | Select-Object -First 1).Trim()
    if ($sourceRunning -ne "true") {
        throw "Source PostgreSQL container $SourceContainer is not running."
    }

    $sourceReady = Get-Scalar $SourceContainer $Database "SELECT 1;"
    if ($sourceReady -ne "1") {
        throw "Source PostgreSQL readiness query returned '$sourceReady'."
    }

    $stamp = Get-Date -Format "yyyyMMddHHmmssfff"
    $script:workDirectory = Join-Path ([IO.Path]::GetTempPath()) "aimes-postgresql-restore-$stamp"
    New-Item -ItemType Directory -Force -Path $script:workDirectory | Out-Null
    $script:sourceDumpPath = "/tmp/aimes-backup-restore-check-$stamp.dump"
    $script:hostDumpPath = Join-Path $script:workDirectory "aimes-backup.dump"
    $script:restoreContainer = "aimes-pg-restore-check-$stamp"

    Add-Line ""
    Add-Line "## Backup"
    Add-Line ""
    Add-Line "- Source readiness query: PASS"
    Invoke-Docker @(
        "exec",
        "-e",
        "PGPASSWORD=$Password",
        $SourceContainer,
        "pg_dump",
        "--format=custom",
        "--no-owner",
        "--no-acl",
        "--username",
        $User,
        "--dbname",
        $Database,
        "--file",
        $script:sourceDumpPath
    ) | Out-Null
    Invoke-Docker @("exec", $SourceContainer, "sh", "-c", "test -s '$($script:sourceDumpPath)'") | Out-Null
    Invoke-Docker @("cp", "$SourceContainer`:$($script:sourceDumpPath)", $script:hostDumpPath) | Out-Null
    $dumpLength = (Get-Item -LiteralPath $script:hostDumpPath).Length
    if ($dumpLength -le 0) {
        throw "pg_dump produced an empty dump."
    }
    Add-Line "- Custom-format dump created: true"
    Add-Line "- Dump size bytes: $dumpLength"

    Add-Line ""
    Add-Line "## Isolated restore"
    Add-Line ""
    Invoke-Docker @(
        "run",
        "-d",
        "--name",
        $script:restoreContainer,
        "--label",
        "aimes.backup-restore-check=true",
        "-e",
        "POSTGRES_PASSWORD=$Password",
        "-e",
        "POSTGRES_DB=restore",
        $RestoreImage
    ) | Out-Null

    $restoreReady = $false
    $stableReadyProbes = 0
    for ($attempt = 0; $attempt -lt 60; $attempt++) {
        try {
            Invoke-Docker @("exec", $script:restoreContainer, "pg_isready", "-U", $User, "-d", "restore") | Out-Null
            $probe = Get-Scalar $script:restoreContainer "restore" "SELECT 1;"
            if ($probe -eq "1") {
                $stableReadyProbes++
            } else {
                $stableReadyProbes = 0
            }
            if ($stableReadyProbes -ge 3) {
                $restoreReady = $true
                break
            }
        } catch {
            $stableReadyProbes = 0
            Start-Sleep -Milliseconds 500
        }
        Start-Sleep -Milliseconds 500
    }
    if (-not $restoreReady) {
        throw "Isolated restore PostgreSQL container did not become ready within 30 seconds."
    }

    Invoke-Docker @("cp", $script:hostDumpPath, "$($script:restoreContainer):/tmp/aimes-backup.dump") | Out-Null
    Invoke-Docker @(
        "exec",
        "-e",
        "PGPASSWORD=$Password",
        $script:restoreContainer,
        "pg_restore",
        "--exit-on-error",
        "--no-owner",
        "--no-acl",
        "--username",
        $User,
        "--dbname",
        "restore",
        "/tmp/aimes-backup.dump"
    ) | Out-Null

    $queries = [ordered]@{
        "public tables" = "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';"
        "EF migrations" = 'SELECT count(*) FROM public."__EFMigrationsHistory";'
        "system users" = "SELECT count(*) FROM public.system_users;"
        "audit logs" = "SELECT count(*) FROM public.audit_logs;"
    }
    foreach ($entry in $queries.GetEnumerator()) {
        $sourceCount = Get-Scalar $SourceContainer $Database $entry.Value
        $restoreCount = Get-Scalar $script:restoreContainer "restore" $entry.Value
        if ($sourceCount -ne $restoreCount) {
            throw "Restore row-count mismatch for $($entry.Key): source=$sourceCount, restore=$restoreCount."
        }
        Add-Line "- $($entry.Key): source=$sourceCount, restore=$restoreCount"
    }

    Add-Line "- Disposable restore container completed: true"
    $result = "PASS"
} catch {
    $failure = $_.Exception.Message
    Add-Line "- Failure type: $($_.Exception.GetType().FullName)"
    throw
} finally {
    Remove-TemporaryResources
    Write-Report
}

if ($result -ne "PASS") {
    throw "PostgreSQL backup/restore gate failed. See $ReportPath."
}
