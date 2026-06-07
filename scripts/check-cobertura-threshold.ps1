param(
    [string]$CoverageGlob = "TestResults/**/coverage.cobertura.xml",
    [double]$LineThreshold = 1,
    [double]$BranchThreshold = 1
)

$ErrorActionPreference = "Stop"

if ($LineThreshold -lt 0 -or $LineThreshold -gt 100) {
    throw "LineThreshold must be between 0 and 100."
}

if ($BranchThreshold -lt 0 -or $BranchThreshold -gt 100) {
    throw "BranchThreshold must be between 0 and 100."
}

function Convert-GlobToRegex([string]$Pattern) {
    $normalized = $Pattern -replace "\\", "/"
    $builder = [System.Text.StringBuilder]::new()

    for ($index = 0; $index -lt $normalized.Length; $index++) {
        $current = $normalized[$index]
        if ($current -eq "*") {
            $isDoubleStar = ($index + 1 -lt $normalized.Length) -and $normalized[$index + 1] -eq "*"
            if ($isDoubleStar) {
                [void]$builder.Append(".*")
                $index++
            } else {
                [void]$builder.Append("[^/]*")
            }
            continue
        }

        [void]$builder.Append([regex]::Escape([string]$current))
    }

    "^$builder$"
}

function Resolve-CoverageFiles([string]$Pattern) {
    $regex = Convert-GlobToRegex $Pattern
    Get-ChildItem -Path . -Recurse -Filter "coverage.cobertura.xml" -File |
        Where-Object { ($_.FullName.Substring((Get-Location).Path.Length + 1) -replace "\\", "/") -match $regex }
}

$coverageFiles = @(Resolve-CoverageFiles $CoverageGlob)
if ($coverageFiles.Count -eq 0) {
    throw "No Cobertura coverage files matched '$CoverageGlob'."
}

$lineWeightedTotal = 0.0
$branchWeightedTotal = 0.0
$lineWeight = 0
$branchWeight = 0

foreach ($file in $coverageFiles) {
    [xml]$coverage = Get-Content -LiteralPath $file.FullName
    $root = $coverage.coverage
    if ($null -eq $root) {
        throw "File '$($file.FullName)' is not a Cobertura coverage file."
    }

    $lineRate = [double]::Parse($root.'line-rate', [System.Globalization.CultureInfo]::InvariantCulture)
    $branchRate = [double]::Parse($root.'branch-rate', [System.Globalization.CultureInfo]::InvariantCulture)
    $linesValid = [int]::Parse($root.'lines-valid', [System.Globalization.CultureInfo]::InvariantCulture)
    $branchesValid = [int]::Parse($root.'branches-valid', [System.Globalization.CultureInfo]::InvariantCulture)

    $lineWeightedTotal += $lineRate * $linesValid
    $lineWeight += $linesValid

    if ($branchesValid -gt 0) {
        $branchWeightedTotal += $branchRate * $branchesValid
        $branchWeight += $branchesValid
    }
}

$lineCoverage = if ($lineWeight -gt 0) { ($lineWeightedTotal / $lineWeight) * 100 } else { 100.0 }
$branchCoverage = if ($branchWeight -gt 0) { ($branchWeightedTotal / $branchWeight) * 100 } else { 100.0 }

Write-Host ("Coverage files: {0}" -f $coverageFiles.Count)
Write-Host ("Line coverage: {0:N2}% (threshold {1:N2}%)" -f $lineCoverage, $LineThreshold)
Write-Host ("Branch coverage: {0:N2}% (threshold {1:N2}%)" -f $branchCoverage, $BranchThreshold)

if ($lineCoverage -lt $LineThreshold) {
    throw ("Line coverage {0:N2}% is below threshold {1:N2}%." -f $lineCoverage, $LineThreshold)
}

if ($branchCoverage -lt $BranchThreshold) {
    throw ("Branch coverage {0:N2}% is below threshold {1:N2}%." -f $branchCoverage, $BranchThreshold)
}
