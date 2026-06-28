param(
    [string]$ReportPath = "_docs/_reports/worktree-inventory-latest.md"
)

$ErrorActionPreference = "Stop"
$repositoryRoot = Split-Path -Parent $PSScriptRoot

function Add-Line([string]$Line = "") {
    $script:reportLines += $Line
}

function Get-Bucket([string]$Path) {
    if ($Path.StartsWith("_docs/", [StringComparison]::Ordinal)) {
        $parts = $Path -split "/"
        if ($parts.Length -ge 2) {
            return "$($parts[0])/$($parts[1])"
        }
        return "_docs"
    }

    if ($Path.StartsWith("src/frontend/", [StringComparison]::Ordinal)) {
        return "src/frontend"
    }

    if ($Path.StartsWith("src/backend/", [StringComparison]::Ordinal)) {
        return "src/backend"
    }

    if ($Path.StartsWith("src/tests/", [StringComparison]::Ordinal)) {
        return "src/tests"
    }

    if ($Path.StartsWith("scripts/", [StringComparison]::Ordinal)) {
        return "scripts"
    }

    return ($Path -split "/")[0]
}

Push-Location $repositoryRoot
try {
    $statusLines = @(git status --porcelain=v1)
    $head = (git rev-parse HEAD).Trim()
    $branch = (git branch --show-current).Trim()
    $total = $statusLines.Count
    $bucketCounts = $statusLines | ForEach-Object {
        if ($_ -match "^..\s+(.+)$") {
            Get-Bucket $matches[1]
        }
    } | Group-Object | Sort-Object Count -Descending

    $reportDirectory = Split-Path -Parent $ReportPath
    if (-not [string]::IsNullOrWhiteSpace($reportDirectory)) {
        New-Item -ItemType Directory -Force -Path $reportDirectory | Out-Null
    }

    $script:reportLines = @()
    Add-Line "# Worktree inventory"
    Add-Line ""
    Add-Line "- GeneratedAt: $(Get-Date -Format o)"
    Add-Line "- Branch: $branch"
    Add-Line "- Head: $head"
    Add-Line "- DirtyEntries: $total"
    Add-Line "- Scope: local uncommitted worktree inventory for release-candidate slicing."
    Add-Line ""
    Add-Line "## Bucket Summary"
    Add-Line ""
    Add-Line "| Bucket | Count |"
    Add-Line "| --- | ---: |"
    foreach ($bucket in $bucketCounts) {
        Add-Line "| $($bucket.Name) | $($bucket.Count) |"
    }
    Add-Line ""
    Add-Line "## Boundary"
    Add-Line ""
    Add-Line "- Hosted CI evidence only covers committed heads after push and workflow completion."
    Add-Line "- This report does not prove the dirty worktree; it only sizes and buckets the uncommitted review surface."
    Add-Line "- Stage or split an intended release-candidate slice before claiming current-head CI coverage."

    Set-Content -Path $ReportPath -Value $script:reportLines -Encoding UTF8
    Write-Host "Worktree inventory report: $ReportPath"
} finally {
    Pop-Location
}
