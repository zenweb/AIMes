param(
    [string]$ReportPath = "_docs/_reports/gray-observation-latest.md",
    [ValidateSet("NOT_STARTED", "OBSERVING", "PASS")]
    [string]$Status = "NOT_STARTED",
    [string]$GrayReleaseId = "",
    [string]$GrayStartedAt = "",
    [string]$ObservationStartedAt = "",
    [string]$ObservationEndedAt = "",
    [int]$P0IncidentCount = -1,
    [int]$P1IncidentCount = -1,
    [string]$Evidence = "",
    [string]$SecuritySignoffPath = "_docs/_review/20260607-security-signoff.md"
)

$ErrorActionPreference = "Stop"
$failResultToken = "Result: FAIL"
$script:repositoryRoot = Split-Path -Parent $PSScriptRoot

function Add-Line([string]$Line = "") {
    $script:reportLines += $Line
}

function Test-HasValue([string]$Value) {
    return -not [string]::IsNullOrWhiteSpace($Value)
}

function Test-RealEvidence([string]$Value) {
    $placeholderEvidenceMessage = "Evidence cannot be a placeholder"

    if (-not (Test-HasValue $Value)) {
        return $false
    }

    $trimmed = $Value.Trim()
    $tail = if ($trimmed.Contains(":")) { $trimmed.Substring($trimmed.LastIndexOf(":") + 1).Trim() } else { $trimmed }
    $placeholders = @("TBD", "TODO", "PENDING", "UNSIGNED", "FAIL", "待补", "待定")
    return -not ($placeholders | Where-Object {
        [string]::Equals($trimmed, $_, [StringComparison]::OrdinalIgnoreCase) -or
            [string]::Equals($tail, $_, [StringComparison]::OrdinalIgnoreCase)
    } | Select-Object -First 1)
}

function Test-EvidenceReferenceExists([string]$Value) {
    if ([string]::IsNullOrWhiteSpace($Value)) {
        return $false
    }

    # Repo-local evidence references are accepted under _docs/ and output/.
    $evidenceReferences = Get-EvidenceReferencePaths $Value
    if ($evidenceReferences.Count -eq 0) {
        return $true
    }

    foreach ($evidencePath in $evidenceReferences) {
        $relativePath = $evidencePath.Replace('/', [System.IO.Path]::DirectorySeparatorChar)
        $candidate = Join-Path $script:repositoryRoot $relativePath
        if (-not (Test-Path $candidate)) {
            return $false
        }
    }

    return $true
}

function Test-IncidentQueryEvidenceContentPass(
    [string]$Value,
    [string]$ExpectedGrayReleaseId,
    [DateTimeOffset]$ExpectedObservationStartedAt,
    [DateTimeOffset]$ExpectedObservationEndedAt
) {
    if (-not (Test-RealEvidence $ExpectedGrayReleaseId)) {
        return $false
    }

    $evidenceReferences = Get-EvidenceReferencePaths $Value
    if ($evidenceReferences.Count -eq 0) {
        return $false
    }

    $startDateToken = $ExpectedObservationStartedAt.ToString("yyyy-MM-dd")
    $endDateToken = $ExpectedObservationEndedAt.ToString("yyyy-MM-dd")

    foreach ($evidencePath in $evidenceReferences) {
        if ($evidencePath -notmatch '\.(?:md|json|txt|log|csv|html)$') {
            continue
        }

        $relativePath = $evidencePath.Replace('/', [System.IO.Path]::DirectorySeparatorChar)
        $candidate = Join-Path $script:repositoryRoot $relativePath
        if (-not (Test-Path $candidate)) {
            continue
        }

        $text = Get-Content -Raw -Path $candidate
        $hasGrayReleaseId = $text.IndexOf($ExpectedGrayReleaseId, [StringComparison]::Ordinal) -ge 0
        $hasWindowStart = $text.IndexOf($startDateToken, [StringComparison]::Ordinal) -ge 0
        $hasWindowEnd = $text.IndexOf($endDateToken, [StringComparison]::Ordinal) -ge 0
        $hasZeroP0 = $text -match '(?i)(?:P0\s*(?:=|:)\s*0|P0\s+incident(?:s| count)?\s*:\s*0)'
        $hasZeroP1 = $text -match '(?i)(?:P1\s*(?:=|:)\s*0|P1\s+incident(?:s| count)?\s*:\s*0)'
        $hasMonitoringVocabulary = $text -match '(?i)(monitoring|incident query|incident search|on-call|gray observation|production incidents)'

        if ($hasGrayReleaseId -and $hasWindowStart -and $hasWindowEnd -and $hasZeroP0 -and $hasZeroP1 -and $hasMonitoringVocabulary) {
            return $true
        }
    }

    return $false
}

function Get-EvidenceReferencePaths([string]$Value) {
    if ([string]::IsNullOrWhiteSpace($Value)) {
        return @()
    }

    return @($Value |
        Select-String -AllMatches -Pattern '(?:_docs|output)/[A-Za-z0-9._/-]+\.(?:md|png|jpg|jpeg|webp|json|txt|log|zip|html|pdf|csv)' |
        ForEach-Object { $_.Matches } |
        ForEach-Object { $_.Value.TrimEnd(',', ';', '.', ':', ')', ']') })
}

function Read-TextOrEmpty([string]$Path) {
    if (-not (Test-Path $Path)) {
        return ""
    }

    return Get-Content -Raw -Path $Path
}

function Test-AnchoredReportPass([string]$Text) {
    $lines = $Text -split "`r?`n"
    return ($lines | Where-Object {
        $_ -match '^- Result: PASS\s*$' -or $_ -match '^Result: PASS\s*$'
    } | Select-Object -First 1) -ne $null
}

function Test-AnchoredLiteralLine([string[]]$Lines, [string]$Text) {
    $escapedText = [regex]::Escape($Text)
    return ($Lines | Where-Object {
        $_ -match "^- $escapedText\s*$" -or $_ -match "^$escapedText\s*$"
    } | Select-Object -First 1) -ne $null
}

function Get-AnchoredLineValues([string[]]$Lines, [string]$Label) {
    $escapedLabel = [regex]::Escape($Label)
    return @($Lines | ForEach-Object {
        if ($_ -match "^- $escapedLabel\s*:\s*(.+?)\s*$" -or $_ -match "^$escapedLabel\s*:\s*(.+?)\s*$") {
            $matches[1]
        }
    })
}

function Test-GrayMonitoringEvidenceReferencePass([string]$EvidenceValue) {
    $evidenceReferences = Get-EvidenceReferencePaths $EvidenceValue
    if ($evidenceReferences.Count -eq 0) {
        return $false
    }

    foreach ($evidencePath in $evidenceReferences) {
        $relativePath = $evidencePath.Replace('/', [System.IO.Path]::DirectorySeparatorChar)
        $candidate = Join-Path $script:repositoryRoot $relativePath
        if (-not (Test-Path $candidate)) {
            continue
        }

        $text = Get-Content -Raw -Path $candidate
        $lines = $text -split "`r?`n"
        $hasReviewedStatus = (Get-AnchoredLineValues $lines "Status" | Where-Object {
            [string]::Equals($_, "REVIEWED", [StringComparison]::OrdinalIgnoreCase) -or
                [string]::Equals($_, "PASS", [StringComparison]::OrdinalIgnoreCase)
        } | Select-Object -First 1) -ne $null
        $hasPassResult = Test-AnchoredReportPass $text
        $hasReviewer = (Get-AnchoredLineValues $lines "Reviewer" | Where-Object { Test-RealEvidence $_ } | Select-Object -First 1) -ne $null
        $grayReleaseId = Get-AnchoredLineValues $lines "GrayReleaseId" | Where-Object { Test-RealEvidence $_ } | Select-Object -First 1
        $reviewedAt = Get-AnchoredLineValues $lines "ReviewedAt" | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | Select-Object -First 1
        $observationStartedAt = Get-AnchoredLineValues $lines "ObservationStartedAt" | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | Select-Object -First 1
        $observationEndedAt = Get-AnchoredLineValues $lines "ObservationEndedAt" | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | Select-Object -First 1
        $incidentQueryEvidence = Get-AnchoredLineValues $lines "IncidentQueryEvidence" | Where-Object { Test-RealEvidence $_ } | Select-Object -First 1
        $hasReviewedAt = $false
        $hasObservationWindow = $false
        $started = [DateTimeOffset]::MinValue
        $ended = [DateTimeOffset]::MinValue

        try {
            $reviewedAtTimestamp = [DateTimeOffset]::Parse($reviewedAt)
            $hasReviewedAt = $reviewedAtTimestamp -le [DateTimeOffset]::UtcNow
        } catch {
            $hasReviewedAt = $false
        }

        try {
            $started = [DateTimeOffset]::Parse($observationStartedAt)
            $ended = [DateTimeOffset]::Parse($observationEndedAt)
            $hasObservationWindow = ($ended - $started).TotalDays -ge 14 -and $ended -le [DateTimeOffset]::UtcNow
        } catch {
            $hasObservationWindow = $false
        }

        $hasZeroP0P1 = Test-AnchoredLiteralLine $lines "P0/P1 incident counts: P0=0; P1=0"
        $hasMonitoringSource = (Get-AnchoredLineValues $lines "MonitoringSource" | Where-Object { Test-RealEvidence $_ } | Select-Object -First 1) -ne $null
        $hasIncidentQueryEvidence = Test-RealEvidence $incidentQueryEvidence
        $hasIncidentQueryEvidenceContent = $hasObservationWindow -and (Test-IncidentQueryEvidenceContentPass $incidentQueryEvidence $grayReleaseId $started $ended)

        if ($hasReviewedStatus -and $hasPassResult -and $hasReviewer -and $hasReviewedAt -and $hasObservationWindow -and $hasZeroP0P1 -and $hasMonitoringSource -and $hasIncidentQueryEvidence -and $hasIncidentQueryEvidenceContent) {
            return $true
        }
    }

    return $false
}

function Test-SecuritySignoffSigned([string]$Text) {
    $lines = $Text -split "`r?`n"
    $hasSignedStatus = (Get-AnchoredLineValues $lines "Status" | Where-Object {
        [string]::Equals($_, "SIGNED", [StringComparison]::OrdinalIgnoreCase)
    } | Select-Object -First 1) -ne $null
    $hasSignedDecision = (Get-AnchoredLineValues $lines "Decision" | Where-Object {
        [string]::Equals($_, "SIGNED", [StringComparison]::OrdinalIgnoreCase)
    } | Select-Object -First 1) -ne $null
    $hasSigner = (Get-AnchoredLineValues $lines "Signer" | Where-Object { Test-RealEvidence $_ } | Select-Object -First 1) -ne $null
    $signedAt = Get-AnchoredLineValues $lines "SignedAt" | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | Select-Object -First 1
    $hasValidSignedAt = $false

    if (-not [string]::IsNullOrWhiteSpace($signedAt)) {
        try {
            $signedAtTimestamp = [DateTimeOffset]::Parse($signedAt)
            $hasValidSignedAt = $signedAtTimestamp -le [DateTimeOffset]::UtcNow
        } catch {
            $hasValidSignedAt = $false
        }
    }

    $hasEvidence = (Get-AnchoredLineValues $lines "Evidence" | Where-Object { Test-RealEvidence $_ } | Select-Object -First 1) -ne $null
    $hasAttackChainPass = (Get-AnchoredLineValues $lines "Attack Chain A/B/C" | Where-Object {
        [string]::Equals($_, "PASS", [StringComparison]::OrdinalIgnoreCase)
    } | Select-Object -First 1) -ne $null

    return $hasSignedStatus `
        -and $hasSignedDecision `
        -and $hasSigner `
        -and $hasValidSignedAt `
        -and $hasEvidence `
        -and $hasAttackChainPass `
        -and (Test-AnchoredReportPass $Text)
}

$reportDirectory = Split-Path -Parent $ReportPath
if (-not [string]::IsNullOrWhiteSpace($reportDirectory)) {
    New-Item -ItemType Directory -Force -Path $reportDirectory | Out-Null
}

$violations = New-Object System.Collections.Generic.List[string]
$securitySignoffText = Read-TextOrEmpty $SecuritySignoffPath

if ($Status -eq "NOT_STARTED") {
    $violations.Add("First gray release has not started.")
}

if ($Status -eq "OBSERVING") {
    $violations.Add("Gray observation is still running.")
}

if ($Status -ne "NOT_STARTED" -and -not (Test-SecuritySignoffSigned $securitySignoffText)) {
    $violations.Add("Security signoff must be SIGNED and PASS with signer, SignedAt, evidence, and Attack Chain PASS before gray release starts.")
}

if ($Status -ne "NOT_STARTED" -and -not (Test-RealEvidence $GrayReleaseId)) {
    $violations.Add("GrayReleaseId is required after gray release starts. GrayReleaseId cannot be a placeholder.")
}

if ($Status -ne "NOT_STARTED" -and -not (Test-HasValue $GrayStartedAt)) {
    $violations.Add("GrayStartedAt is required after gray release starts.")
}

if ($Status -eq "OBSERVING") {
    if (-not (Test-HasValue $ObservationStartedAt)) {
        $violations.Add("ObservationStartedAt is required while gray observation is running.")
    }

    if (-not (Test-RealEvidence $Evidence)) {
        $violations.Add("OBSERVING requires gray start evidence. Evidence cannot be a placeholder.")
    } elseif (-not (Test-EvidenceReferenceExists $Evidence)) {
        $violations.Add("Gray observation evidence reference does not exist. Evidence reference does not exist.")
    }
}

if ($Status -eq "PASS") {
    if (-not (Test-HasValue $ObservationStartedAt)) {
        $violations.Add("ObservationStartedAt is required for PASS.")
    }

    if (-not (Test-HasValue $ObservationEndedAt)) {
        $violations.Add("ObservationEndedAt is required for PASS.")
    }

    if ($P0IncidentCount -ne 0 -or $P1IncidentCount -ne 0) {
        $violations.Add("PASS requires zero P0/P1 incidents during the observation window.")
    }

    try {
        $grayStarted = [DateTimeOffset]::Parse($GrayStartedAt)
        $started = [DateTimeOffset]::Parse($ObservationStartedAt)
        $ended = [DateTimeOffset]::Parse($ObservationEndedAt)
        if ($grayStarted -gt $started) {
            $violations.Add("GrayStartedAt must not be after ObservationStartedAt.")
        }

        if ($ended -gt [DateTimeOffset]::UtcNow) {
            $violations.Add("ObservationEndedAt must not be in the future.")
        }

        if (($ended - $started).TotalDays -lt 14) {
            $violations.Add("PASS requires an observation window of at least 14 calendar days.")
        }
    } catch {
        $violations.Add("GrayStartedAt, ObservationStartedAt, and ObservationEndedAt must be parseable timestamps for PASS.")
    }

    if (-not (Test-RealEvidence $Evidence)) {
        $violations.Add("PASS requires evidence links or incident query references. Evidence cannot be a placeholder.")
    } elseif (-not (Test-EvidenceReferenceExists $Evidence)) {
        $violations.Add("Gray observation evidence reference does not exist. Evidence reference does not exist.")
    } elseif (-not (Test-GrayMonitoringEvidenceReferencePass $Evidence)) {
        $violations.Add("Gray observation evidence must include a repo-local reviewed monitoring or incident-review PASS packet with validated IncidentQueryEvidence content.")
    }
}

$result = if ($violations.Count -eq 0) { "PASS" } else { "FAIL" }

$script:reportLines = @()
Add-Line "# Gray observation"
Add-Line ""
Add-Line "- GeneratedAt: $(Get-Date -Format o)"
Add-Line "- Status: $Status"
Add-Line "- GrayReleaseId: $GrayReleaseId"
Add-Line "- GrayStartedAt: $GrayStartedAt"
Add-Line "- ObservationStartedAt: $ObservationStartedAt"
Add-Line "- ObservationEndedAt: $ObservationEndedAt"
Add-Line "- Required observation window: 14 calendar days"
Add-Line "- P0/P1 incident counts: P0=$P0IncidentCount; P1=$P1IncidentCount"
Add-Line "- Evidence: $Evidence"
Add-Line "- SecuritySignoffPath: $SecuritySignoffPath"
Add-Line ""
Add-Line "## Gate"
Add-Line ""
Add-Line "- First gray release: required before v1.0.0."
Add-Line "- Observation window: 2 weeks with no P0/P1 incidents."
Add-Line "- Result: $result"

if ($violations.Count -gt 0) {
    Add-Line ""
    Add-Line "## Violations"
    Add-Line ""
    foreach ($violation in $violations) {
        Add-Line "- $violation"
    }
    Add-Line ""
    Add-Line "This report cannot close the v1.0.0 release gate."
}

Set-Content -Path $ReportPath -Value $script:reportLines -Encoding UTF8
Write-Host "Gray observation report: $ReportPath"

if ($result -ne "PASS") {
    throw "Gray observation gate failed. See $ReportPath."
}
