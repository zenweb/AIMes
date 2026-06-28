param(
    [string]$ManifestPath = "_docs/_reports/release-candidate-slice-20260621-schedule-labor-evidence-retry.manifest.json",
    [string]$ReportPath = "_docs/_reports/release-candidate-slice-hunk-map-latest.md",
    [ValidateSet("working", "staged")]
    [string]$DiffMode = "working"
)

$ErrorActionPreference = "Stop"
$repositoryRoot = Split-Path -Parent $PSScriptRoot

function Add-Line([string]$Line = "") {
    $script:reportLines += $Line
}

function Get-HunkClassification([string]$HunkText, [string[]]$IncludedTokens, [object[]]$ExcludedThemes) {
    $includedHits = New-Object System.Collections.Generic.List[string]
    foreach ($token in $IncludedTokens) {
        if (-not [string]::IsNullOrWhiteSpace($token) -and $HunkText.Contains($token)) {
            $includedHits.Add($token)
        }
    }

    $excludedHits = New-Object System.Collections.Generic.List[string]
    foreach ($theme in $ExcludedThemes) {
        foreach ($token in @($theme.grepTokens)) {
            if (-not [string]::IsNullOrWhiteSpace($token) -and $HunkText.Contains([string]$token)) {
                $excludedHits.Add("$($theme.name): $token")
            }
        }
    }

    $classification = if ($includedHits.Count -gt 0 -and $excludedHits.Count -eq 0) {
        "KEEP_CANDIDATE"
    } elseif ($includedHits.Count -eq 0 -and $excludedHits.Count -gt 0) {
        "EXCLUDE_THEME"
    } elseif ($includedHits.Count -gt 0 -and $excludedHits.Count -gt 0) {
        "MIXED_REQUIRES_MANUAL_SPLIT"
    } else {
        "NEUTRAL_REVIEW"
    }

    [pscustomobject]@{
        Classification = $classification
        IncludedHits = @($includedHits)
        ExcludedHits = @($excludedHits)
    }
}

function Get-DiffHunks([string[]]$DiffLines) {
    $hunks = New-Object System.Collections.Generic.List[object]
    $currentFile = $null
    $currentHeader = $null
    $currentLines = New-Object System.Collections.Generic.List[string]

    function Flush-Hunk {
        if ($null -eq $script:currentHeaderForFlush) {
            return
        }
    }

    foreach ($line in $DiffLines) {
        if ($line.StartsWith("diff --git ")) {
            if ($null -ne $currentHeader) {
                $hunks.Add([pscustomobject]@{
                    File = $currentFile
                    Header = $currentHeader
                    Text = ($currentLines -join "`n")
                })
                $currentHeader = $null
                $currentLines = New-Object System.Collections.Generic.List[string]
            }
            $parts = $line.Split(" ")
            if ($parts.Count -ge 4) {
                $currentFile = $parts[3] -replace "^b/", ""
            }
            continue
        }

        if ($line.StartsWith("@@")) {
            if ($null -ne $currentHeader) {
                $hunks.Add([pscustomobject]@{
                    File = $currentFile
                    Header = $currentHeader
                    Text = ($currentLines -join "`n")
                })
            }
            $currentHeader = $line
            $currentLines = New-Object System.Collections.Generic.List[string]
            $currentLines.Add($line)
            continue
        }

        if ($null -ne $currentHeader) {
            $currentLines.Add($line)
        }
    }

    if ($null -ne $currentHeader) {
        $hunks.Add([pscustomobject]@{
            File = $currentFile
            Header = $currentHeader
            Text = ($currentLines -join "`n")
        })
    }

    return $hunks
}

function Get-DiffFiles([string]$Mode) {
    $files = if ($Mode -eq "staged") {
        @(git diff --cached --name-only)
    } else {
        @(git diff --name-only)
    }

    return @($files | Where-Object {
        $_ -like "src/*" -or $_ -like "scripts/*"
    })
}

Push-Location $repositoryRoot
try {
    if (-not (Test-Path $ManifestPath)) {
        throw "Manifest not found: $ManifestPath"
    }

    $manifest = Get-Content -Raw -Encoding UTF8 -Path $ManifestPath | ConvertFrom-Json
    $candidateFiles = @($manifest.firstSlice.files | Where-Object {
        $_ -like "src/*" -or $_ -like "scripts/*"
    })
    if ($candidateFiles.Count -eq 0) {
        throw "Manifest contains no code/script files to inspect."
    }

    $diffFiles = Get-DiffFiles $DiffMode
    $missingManifestFiles = @($diffFiles | Where-Object {
        $candidateFiles -notcontains $_
    })

    $diffOutput = if ($DiffMode -eq "staged") {
        @(git diff --cached -- @candidateFiles)
    } else {
        @(git diff -- @candidateFiles)
    }

    $hunks = Get-DiffHunks $diffOutput
    $classifiedHunks = foreach ($hunk in $hunks) {
        $classification = Get-HunkClassification `
            -HunkText $hunk.Text `
            -IncludedTokens @($manifest.firstSlice.grepTokens) `
            -ExcludedThemes @($manifest.excludedThemes)

        [pscustomobject]@{
            File = $hunk.File
            Header = $hunk.Header
            Classification = $classification.Classification
            IncludedHits = @($classification.IncludedHits)
            ExcludedHits = @($classification.ExcludedHits)
        }
    }

    $reportDirectory = Split-Path -Parent $ReportPath
    if (-not [string]::IsNullOrWhiteSpace($reportDirectory)) {
        New-Item -ItemType Directory -Force -Path $reportDirectory | Out-Null
    }

    $summary = $classifiedHunks | Group-Object Classification | Sort-Object Name
    $script:reportLines = @()
    Add-Line "# Release Candidate Slice Hunk Map"
    Add-Line ""
    Add-Line "- GeneratedAt: $(Get-Date -Format o)"
    Add-Line "- ManifestPath: $ManifestPath"
    Add-Line "- Candidate: $($manifest.candidate)"
    Add-Line "- FirstSlice: $($manifest.firstSlice.name)"
    Add-Line "- DiffMode: $DiffMode"
    Add-Line "- HunkCount: $($classifiedHunks.Count)"
    Add-Line ""
    Add-Line "## Diff Files Missing From Manifest"
    Add-Line ""
    if ($missingManifestFiles.Count -eq 0) {
        Add-Line "- none"
    } else {
        foreach ($file in $missingManifestFiles) {
            Add-Line "- $file"
        }
    }
    Add-Line ""
    Add-Line "## Summary"
    Add-Line ""
    if ($summary.Count -eq 0) {
        Add-Line "- none"
    } else {
        foreach ($group in $summary) {
            Add-Line "- $($group.Name): $($group.Count)"
        }
    }
    Add-Line ""
    Add-Line "## Hunk Classifications"
    Add-Line ""
    if ($classifiedHunks.Count -eq 0) {
        Add-Line "- none"
    } else {
        foreach ($hunk in $classifiedHunks) {
            $includedHitText = if ($hunk.IncludedHits.Count -eq 0) { "none" } else { $hunk.IncludedHits -join "; " }
            $excludedHitText = if ($hunk.ExcludedHits.Count -eq 0) { "none" } else { $hunk.ExcludedHits -join "; " }
            Add-Line "### $($hunk.Classification) - $($hunk.File)"
            Add-Line ""
            Add-Line "- Header: $($hunk.Header)"
            Add-Line "- IncludedHits: $includedHitText"
            Add-Line "- ExcludedHits: $excludedHitText"
            Add-Line ""
        }
    }
    Add-Line "## Guidance"
    Add-Line ""
    Add-Line "- Stage KEEP_CANDIDATE hunks only after human review."
    Add-Line "- Do not stage EXCLUDE_THEME hunks for this first labor retry slice."
    Add-Line "- Split MIXED_REQUIRES_MANUAL_SPLIT hunks manually before staging."
    Add-Line "- Treat NEUTRAL_REVIEW hunks as dependencies; include only when needed by a reviewed keep hunk."

    Set-Content -Path $ReportPath -Value $script:reportLines -Encoding UTF8
    Write-Host "Release candidate slice hunk map report: $ReportPath"
} finally {
    Pop-Location
}
