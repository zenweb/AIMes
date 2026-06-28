param(
    [string]$ManifestPath = "_docs/_reports/release-candidate-slice-20260621-schedule-labor-evidence-retry.manifest.json",
    [string]$ReportPath = "_docs/_reports/release-candidate-slice-boundary-latest.md",
    [ValidateSet("working", "staged")]
    [string]$DiffMode = "working"
)

$ErrorActionPreference = "Stop"
$repositoryRoot = Split-Path -Parent $PSScriptRoot

function Add-Line([string]$Line = "") {
    $script:reportLines += $Line
}

function Test-TokenInDiff([string]$DiffText, [string]$Token) {
    if ([string]::IsNullOrWhiteSpace($Token)) {
        return $false
    }

    return $DiffText.Contains($Token)
}

function Find-TokenLocations([string[]]$Files, [string[]]$Tokens) {
    $locations = New-Object System.Collections.Generic.List[string]
    foreach ($file in $Files) {
        if (-not (Test-Path $file)) {
            continue
        }

        $lines = Get-Content -Encoding UTF8 -Path $file
        for ($index = 0; $index -lt $lines.Count; $index += 1) {
            foreach ($token in $Tokens) {
                if (-not [string]::IsNullOrWhiteSpace($token) -and $lines[$index].Contains($token)) {
                    $locations.Add("${file}:$($index + 1): $token")
                }
            }
        }
    }

    return $locations
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
    $diffText = $diffOutput -join "`n"
    $excludedHits = New-Object System.Collections.Generic.List[string]
    $excludedTokens = New-Object System.Collections.Generic.List[string]
    foreach ($theme in @($manifest.excludedThemes)) {
        foreach ($token in @($theme.grepTokens)) {
            if (Test-TokenInDiff $diffText $token) {
                $excludedHits.Add("$($theme.name): $token")
                $excludedTokens.Add([string]$token)
            }
        }
    }

    $includedHits = New-Object System.Collections.Generic.List[string]
    $includedTokens = New-Object System.Collections.Generic.List[string]
    foreach ($token in @($manifest.firstSlice.grepTokens)) {
        if (Test-TokenInDiff $diffText $token) {
            $includedHits.Add($token)
            $includedTokens.Add([string]$token)
        }
    }
    $includedLocations = Find-TokenLocations $candidateFiles @($includedTokens)
    $excludedLocations = Find-TokenLocations $candidateFiles @($excludedTokens)

    $missingStagedSlice = $DiffMode -eq "staged" -and $includedHits.Count -eq 0
    $result = if ($excludedHits.Count -eq 0 -and -not $missingStagedSlice -and $missingManifestFiles.Count -eq 0) { "PASS" } else { "FAIL" }

    $reportDirectory = Split-Path -Parent $ReportPath
    if (-not [string]::IsNullOrWhiteSpace($reportDirectory)) {
        New-Item -ItemType Directory -Force -Path $reportDirectory | Out-Null
    }

    $script:reportLines = @()
    Add-Line "# Release Candidate Slice Boundary"
    Add-Line ""
    Add-Line "- GeneratedAt: $(Get-Date -Format o)"
    Add-Line "- ManifestPath: $ManifestPath"
    Add-Line "- Candidate: $($manifest.candidate)"
    Add-Line "- FirstSlice: $($manifest.firstSlice.name)"
    Add-Line "- DiffMode: $DiffMode"
    Add-Line "- Result: $result"
    Add-Line ""
    Add-Line "## Inspected Files"
    Add-Line ""
    foreach ($file in $candidateFiles) {
        Add-Line "- $file"
    }
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
    Add-Line "## Included Slice Token Hits"
    Add-Line ""
    if ($includedHits.Count -eq 0) {
        Add-Line "- none"
    } else {
        foreach ($hit in $includedHits) {
            Add-Line "- $hit"
        }
    }
    Add-Line ""
    Add-Line "## Excluded Theme Token Hits"
    Add-Line ""
    if ($excludedHits.Count -eq 0) {
        Add-Line "- none"
    } else {
        foreach ($hit in $excludedHits) {
            Add-Line "- $hit"
        }
    }
    Add-Line ""
    Add-Line "## Included Slice Token Locations"
    Add-Line ""
    if ($includedLocations.Count -eq 0) {
        Add-Line "- none"
    } else {
        foreach ($location in $includedLocations) {
            Add-Line "- $location"
        }
    }
    Add-Line ""
    Add-Line "## Excluded Theme Token Locations"
    Add-Line ""
    if ($excludedLocations.Count -eq 0) {
        Add-Line "- none"
    } else {
        foreach ($location in $excludedLocations) {
            Add-Line "- $location"
        }
    }
    Add-Line ""
    Add-Line "## Gate"
    Add-Line ""
    if ($result -eq "PASS") {
        Add-Line "- Boundary check passed: $DiffMode diff does not contain excluded-theme tokens from the manifest."
    } elseif ($missingManifestFiles.Count -gt 0) {
        Add-Line "- Boundary check failed: $DiffMode diff contains code/script files that are not listed in the manifest. Add them to the manifest or split them out before using this as a push gate."
    } elseif ($missingStagedSlice) {
        Add-Line "- Boundary check failed: staged diff does not contain first-slice tokens. Stage the intended candidate before using this as a push gate."
    } else {
        Add-Line "- Boundary check failed: $DiffMode diff contains excluded-theme tokens. Split the candidate before staging or pushing."
    }

    Set-Content -Path $ReportPath -Value $script:reportLines -Encoding UTF8
    Write-Host "Release candidate slice boundary report: $ReportPath"

    if ($result -ne "PASS") {
        throw "Release candidate slice boundary failed. See $ReportPath."
    }
} finally {
    Pop-Location
}
