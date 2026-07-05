param(
    [string]$ReportPath = "_docs/_reports/release-gate-audit-latest.md",
    [string]$HostedCiReportPath = "_docs/_reports/hosted-ci-20260611-v1-pass.md",
    [string]$StagingReportPath = "_docs/_reports/staging-rehearsal-20260611-docker-restored.md",
    [string]$AttackChainReportPath = "_docs/_reports/attack-chain-verification-20260611-manual-pending.md",
    [string]$SecuritySignoffPath = "_docs/_review/20260607-security-signoff.md",
    [string]$GrayObservationReportPath = "_docs/_reports/gray-observation-20260607-not-started.md",
    [switch]$DeferGrayObservation
)

$ErrorActionPreference = "Stop"
$failResultToken = "Result: FAIL"
$script:repositoryRoot = Split-Path -Parent $PSScriptRoot

function Add-Line([string]$Line = "") {
    $script:reportLines += $Line
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

function Test-AnchoredSignoffSigned([string]$Text) {
    $lines = $Text -split "`r?`n"
    $hasSignedStatus = ($lines | Where-Object {
        $_ -match '^- Status: SIGNED\s*$' -or $_ -match '^Status: SIGNED\s*$'
    } | Select-Object -First 1) -ne $null
    $hasSignedDecision = ($lines | Where-Object {
        $_ -match '^- Decision: SIGNED\s*$' -or $_ -match '^Decision: SIGNED\s*$'
    } | Select-Object -First 1) -ne $null
    return $hasSignedStatus -and $hasSignedDecision
}

function Test-RealEvidence([string]$Value) {
    $placeholderEvidenceMessage = "Evidence cannot be a placeholder"

    if ([string]::IsNullOrWhiteSpace($Value)) {
        return $false
    }

    $trimmed = $Value.Trim()
    $tail = if ($trimmed.Contains(":")) { $trimmed.Substring($trimmed.LastIndexOf(":") + 1).Trim() } else { $trimmed }
    $placeholders = @("TBD", "TODO", "PENDING", "待补", "待定")
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

function Test-GrayMonitoringEvidenceReferencePass([string]$EvidenceValue) {
    $evidenceReferences = Get-EvidenceReferencePaths $EvidenceValue
    if ($evidenceReferences.Count -eq 0) {
        return $true
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

function Test-NoBlockingSecuritySignoffText([string]$Text) {
    $lines = $Text -split "`r?`n"
    $hasUnsignedStatus = (Get-AnchoredLineValues $lines "Status" | Where-Object {
        [string]::Equals($_, "UNSIGNED", [StringComparison]::OrdinalIgnoreCase)
    } | Select-Object -First 1) -ne $null
    $hasUnsignedDecision = (Get-AnchoredLineValues $lines "Decision" | Where-Object {
        [string]::Equals($_, "UNSIGNED", [StringComparison]::OrdinalIgnoreCase)
    } | Select-Object -First 1) -ne $null
    $hasPendingAttackChain = (Get-AnchoredLineValues $lines "Current status" | Where-Object {
        [string]::Equals($_, "PENDING_MANUAL_VERIFICATION", [StringComparison]::OrdinalIgnoreCase)
    } | Select-Object -First 1) -ne $null
    $hasFailedAttackChain = (Get-AnchoredLineValues $lines "Current result" | Where-Object {
        [string]::Equals($_, "FAIL", [StringComparison]::OrdinalIgnoreCase)
    } | Select-Object -First 1) -ne $null

    return -not ($hasUnsignedStatus -or $hasUnsignedDecision -or $hasPendingAttackChain -or $hasFailedAttackChain)
}

function Test-SecuritySignoffEvidencePass([string]$Text) {
    $futureSignedAtMessage = "SignedAt must not be in the future."

    if (-not (Test-AnchoredSignoffSigned $Text)) {
        return $false
    }

    $lines = $Text -split "`r?`n"
    $hasSigner = (Get-AnchoredLineValues $lines "Signer" | Where-Object { Test-RealEvidence $_ } | Select-Object -First 1) -ne $null
    $signedAt = Get-AnchoredLineValues $lines "SignedAt" | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | Select-Object -First 1
    $hasParseableSignedAt = $false
    $hasSignedAtNotFuture = $false

    if (-not [string]::IsNullOrWhiteSpace($signedAt)) {
        try {
            $signedAtTimestamp = [DateTimeOffset]::Parse($signedAt)
            $hasParseableSignedAt = $true
            $hasSignedAtNotFuture = $signedAtTimestamp -le [DateTimeOffset]::UtcNow
            if (-not $hasSignedAtNotFuture) {
                $script:violations.Add($futureSignedAtMessage)
            }
        } catch {
            $hasParseableSignedAt = $false
        }
    }

    $hasSelfAssessment = $Text.Contains("Automated Self-Assessment")
    $hasAttackChain = $Text.Contains("Attack Chain A/B/C")
    $hasEvidence = (Get-AnchoredLineValues $lines "Evidence" | Where-Object { Test-RealEvidence $_ } | Select-Object -First 1) -ne $null

    return $hasSigner `
        -and $hasParseableSignedAt `
        -and $hasSignedAtNotFuture `
        -and $hasSelfAssessment `
        -and $hasAttackChain `
        -and $hasEvidence `
        -and (Test-NoBlockingSecuritySignoffText $Text)
}

function Test-AnchoredLine([string[]]$Lines, [string]$Label, [string]$ExpectedValue) {
    $escapedLabel = [regex]::Escape($Label)
    $escapedValue = [regex]::Escape($ExpectedValue)
    return ($Lines | Where-Object {
        $_ -match "^- $escapedLabel\s*:\s*$escapedValue\s*$" -or $_ -match "^$escapedLabel\s*:\s*$escapedValue\s*$"
    } | Select-Object -First 1) -ne $null
}

function Test-AnchoredLiteralLine([string[]]$Lines, [string]$Text) {
    $escapedText = [regex]::Escape($Text)
    return ($Lines | Where-Object {
        $_ -match "^- $escapedText\s*$" -or $_ -match "^$escapedText\s*$"
    } | Select-Object -First 1) -ne $null
}

function Test-GitHubActionsRunUrl([string]$Value) {
    return (-not [string]::IsNullOrWhiteSpace($Value)) -and ($Value -match '^https://github.com/.+/actions/runs/\d+$')
}

function Test-NumericRunId([string]$Value) {
    return (-not [string]::IsNullOrWhiteSpace($Value)) -and ($Value -match '^\d+$')
}

function Test-GitHubActionsRunUrlMatchesRunId([string]$RunUrlValue, [string]$RunIdValue) {
    return (Test-GitHubActionsRunUrl $RunUrlValue) `
        -and (Test-NumericRunId $RunIdValue) `
        -and ($RunUrlValue -match '/actions/runs/(\d+)$') `
        -and [string]::Equals($matches[1], $RunIdValue, [StringComparison]::Ordinal)
}

function Get-AnchoredLineValues([string[]]$Lines, [string]$Label) {
    $escapedLabel = [regex]::Escape($Label)
    return @($Lines | ForEach-Object {
        if ($_ -match "^- $escapedLabel\s*:\s*(.+?)\s*$" -or $_ -match "^$escapedLabel\s*:\s*(.+?)\s*$") {
            $matches[1]
        }
    })
}

function Test-AttackChainSectionPass([string]$Text, [string]$ChainName) {
    $knownSectionHeadings = @("## Attack Chain A", "## Attack Chain B", "## Attack Chain C")
    $escapedChainName = [regex]::Escape($ChainName)
    $pattern = "(?s)## $escapedChainName\s+(.+?)(?:\r?\n## |\z)"
    $match = [regex]::Match($Text, $pattern)

    if (-not $match.Success) {
        return $false
    }

    $section = $match.Groups[1].Value
    $sectionLines = $section -split "`r?`n"
    $hasManualPass = Test-AnchoredLiteralLine $sectionLines "Manual verification: PASS"
    $evidenceValues = Get-AnchoredLineValues $sectionLines "Evidence"
    $missingEvidenceReferences = @($evidenceValues | Where-Object { (Test-RealEvidence $_) -and -not (Test-EvidenceReferenceExists $_) })
    foreach ($missingReference in $missingEvidenceReferences) {
        $script:violations.Add("$ChainName evidence reference does not exist. Evidence reference does not exist: $missingReference")
    }
    $hasEvidence = ($evidenceValues | Where-Object { (Test-RealEvidence $_) -and (Test-EvidenceReferenceExists $_) } | Select-Object -First 1) -ne $null
    return $hasManualPass -and $hasEvidence
}

function Test-AttackChainEvidencePass([string]$Text) {
    $futureVerifiedAtMessage = "VerifiedAt must not be in the future."

    $lines = $Text -split "`r?`n"
    $hasPassResult = Test-AnchoredReportPass $Text
    $hasVerifiedStatus = Test-AnchoredLiteralLine $lines "Status: VERIFIED"
    $hasVerifier = (Get-AnchoredLineValues $lines "Verifier" | Where-Object { Test-RealEvidence $_ } | Select-Object -First 1) -ne $null
    $verifiedAt = Get-AnchoredLineValues $lines "VerifiedAt" | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | Select-Object -First 1
    $hasParseableVerifiedAt = $false
    $hasVerifiedAtNotFuture = $false

    if (-not [string]::IsNullOrWhiteSpace($verifiedAt)) {
        try {
            $verifiedAtTimestamp = [DateTimeOffset]::Parse($verifiedAt)
            $hasParseableVerifiedAt = $true
            $hasVerifiedAtNotFuture = $verifiedAtTimestamp -le [DateTimeOffset]::UtcNow
        } catch {
            $hasParseableVerifiedAt = $false
        }
    }

    $passChainCount = ($lines | Where-Object {
        $_ -match '^- Manual verification: PASS\s*$' -or $_ -match '^Manual verification: PASS\s*$'
    }).Count
    $evidenceCount = (Get-AnchoredLineValues $lines "Evidence" | Where-Object { (Test-RealEvidence $_) -and (Test-EvidenceReferenceExists $_) }).Count

    return $hasPassResult `
        -and $hasVerifiedStatus `
        -and $hasVerifier `
        -and $hasParseableVerifiedAt `
        -and $hasVerifiedAtNotFuture `
        -and $passChainCount -ge 3 `
        -and $evidenceCount -ge 3 `
        -and (Test-AttackChainSectionPass $Text "Attack Chain A") `
        -and (Test-AttackChainSectionPass $Text "Attack Chain B") `
        -and (Test-AttackChainSectionPass $Text "Attack Chain C")
}

function Test-StagingHealthEndpointPass([string]$Text, [string]$Path) {
    $escapedPath = [regex]::Escape($Path)
    $pattern = "(?s)## Health $escapedPath\s+(.+?)(?:\r?\n## |\z)"
    $match = [regex]::Match($Text, $pattern)

    if (-not $match.Success) {
        return $false
    }

    $section = $match.Groups[1].Value
    return ($section -match 'HTTP 2\d\d') -or ($section -match 'HTTP 3\d\d')
}

function Test-SectionExitCodeZero([string]$Text, [string]$SectionName) {
    $escapedSectionName = [regex]::Escape($SectionName)
    $pattern = "(?s)## $escapedSectionName\s+(.+?)(?:\r?\n## |\z)"
    $match = [regex]::Match($Text, $pattern)

    if (-not $match.Success) {
        return $false
    }

    return $match.Groups[1].Value.Contains("Exit code: 0")
}

function Test-SectionContainsNumberToken([string]$Text, [string]$SectionName, [string]$ExpectedNumber) {
    if ([string]::IsNullOrWhiteSpace($ExpectedNumber)) {
        return $false
    }

    $escapedSectionName = [regex]::Escape($SectionName)
    $pattern = "(?s)## $escapedSectionName\s+(.+?)(?:\r?\n## |\z)"
    $match = [regex]::Match($Text, $pattern)

    if (-not $match.Success) {
        return $false
    }

    $escapedExpectedNumber = [regex]::Escape($ExpectedNumber)
    return $match.Groups[1].Value -match "(?<!\d)$escapedExpectedNumber(?!\d)"
}

function Test-StagingEvidencePass([string]$Text) {
    if (-not (Test-AnchoredReportPass $Text)) {
        return $false
    }

    $requiredTokens = @(
        "ASPNETCORE_ENVIRONMENT: Production",
        "ConnectionStrings__DefaultConnection",
        "Docker version",
        "Start external dependencies",
        "Apply EF migrations",
        "Start API",
        "Health /live",
        "Health /ready"
    )

    foreach ($token in $requiredTokens) {
        if (-not $Text.Contains($token)) {
            return $false
        }
    }

    return (Test-SectionExitCodeZero $Text "Docker version") `
        -and (Test-SectionExitCodeZero $Text "Start external dependencies") `
        -and (Test-SectionExitCodeZero $Text "Apply EF migrations") `
        -and (Test-SectionExitCodeZero $Text "Start API") `
        -and (Test-StagingHealthEndpointPass $Text "/live") `
        -and (Test-StagingHealthEndpointPass $Text "/ready")
}

function Test-HostedCiEvidencePass([string]$Text) {
    if (-not (Test-AnchoredReportPass $Text)) {
        return $false
    }

    $lines = $Text -split "`r?`n"
    $hasReadyStatus = Test-AnchoredLiteralLine $lines "Status: READY_FOR_RELEASE_REVIEW"
    $repository = Get-AnchoredLineValues $lines "Repository" | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | Select-Object -First 1
    $branch = Get-AnchoredLineValues $lines "Branch" | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | Select-Object -First 1
    $hasReleaseRepository = [string]::Equals($repository, "zenweb/AIMes", [StringComparison]::OrdinalIgnoreCase)
    $hasReleaseBranch = [string]::Equals($branch, "V1", [StringComparison]::Ordinal)
    $commitSha = Get-AnchoredLineValues $lines "CommitSha" | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | Select-Object -First 1
    $hasCommitSha = (-not [string]::IsNullOrWhiteSpace($commitSha)) -and ($commitSha -match '^[0-9a-fA-F]{40}$')
    $hasMatchingHeadSha = $hasCommitSha -and ((Get-AnchoredLineValues $lines "HeadSha" | Where-Object {
        [string]::Equals($_, $commitSha, [StringComparison]::OrdinalIgnoreCase)
    } | Select-Object -First 1) -ne $null)
    $runUrl = Get-AnchoredLineValues $lines "RunUrl" | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | Select-Object -First 1
    $runId = Get-AnchoredLineValues $lines "RunId" | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | Select-Object -First 1
    $hasRunUrl = Test-GitHubActionsRunUrl $runUrl
    $hasRunId = Test-NumericRunId $runId
    $hasMatchingRunUrlAndRunId = Test-GitHubActionsRunUrlMatchesRunId $runUrl $runId
    $hasJobSummary = (Get-AnchoredLineValues $lines "Evidence" | Where-Object { Test-RealEvidence $_ -and $_ -match 'job summary' } | Select-Object -First 1) -ne $null
    $hasCiWorkflow = $Text.Contains(".github/workflows/ci.yml: True")
    $hasEvalWorkflow = $Text.Contains(".github/workflows/eval.yml: True")
    $hasGhRun = $Text.Contains("gh run")
    $hasGhRunExitCodeZero = Test-SectionExitCodeZero $Text "gh run"
    $hasGhRunMatchingRunId = Test-SectionContainsNumberToken $Text "gh run" $runId

    return $hasReadyStatus `
        -and $hasRunUrl `
        -and $hasRunId `
        -and $hasMatchingRunUrlAndRunId `
        -and $hasReleaseRepository `
        -and $hasReleaseBranch `
        -and $hasCommitSha `
        -and $hasMatchingHeadSha `
        -and $hasJobSummary `
        -and $hasCiWorkflow `
        -and $hasEvalWorkflow `
        -and $hasGhRun `
        -and $hasGhRunExitCodeZero `
        -and $hasGhRunMatchingRunId
}

function Test-GrayObservationEvidencePass([string]$Text) {
    $futureObservationEndedAtMessage = "ObservationEndedAt must not be in the future."
    $grayStartedAfterObservationMessage = "GrayStartedAt must not be after ObservationStartedAt."

    if (-not (Test-AnchoredReportPass $Text)) {
        return $false
    }

    $lines = $Text -split "`r?`n"
    $hasPassStatus = Test-AnchoredLiteralLine $lines "Status: PASS"
    $hasGrayReleaseId = (Get-AnchoredLineValues $lines "GrayReleaseId" | Where-Object { Test-RealEvidence $_ } | Select-Object -First 1) -ne $null
    $grayStartedAt = Get-AnchoredLineValues $lines "GrayStartedAt" | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | Select-Object -First 1
    $observationStartedAt = Get-AnchoredLineValues $lines "ObservationStartedAt" | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | Select-Object -First 1
    $observationEndedAt = Get-AnchoredLineValues $lines "ObservationEndedAt" | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | Select-Object -First 1
    $hasParseableTimes = $false
    $hasFourteenCalendarDays = $false
    $hasObservationEndedAtNotFuture = $false
    $hasGrayStartedAtNotAfterObservationStartedAt = $false
    $hasGrayStartedAt = -not [string]::IsNullOrWhiteSpace($grayStartedAt)
    $hasObservationStartedAt = -not [string]::IsNullOrWhiteSpace($observationStartedAt)
    $hasObservationEndedAt = -not [string]::IsNullOrWhiteSpace($observationEndedAt)

    if ($hasGrayStartedAt -and $hasObservationStartedAt -and $hasObservationEndedAt) {
        try {
            $grayStarted = [DateTimeOffset]::Parse($grayStartedAt)
            $started = [DateTimeOffset]::Parse($observationStartedAt)
            $ended = [DateTimeOffset]::Parse($observationEndedAt)
            $hasParseableTimes = $true
            $hasFourteenCalendarDays = ($ended - $started).TotalDays -ge 14
            $hasObservationEndedAtNotFuture = $ended -le [DateTimeOffset]::UtcNow
            $hasGrayStartedAtNotAfterObservationStartedAt = $grayStarted -le $started
        } catch {
            $hasParseableTimes = $false
        }
    }

    $hasRequiredWindowText = $Text.Contains("14 calendar days")
    $hasZeroP0P1 = Test-AnchoredLiteralLine $lines "P0/P1 incident counts: P0=0; P1=0"
    $evidenceValues = Get-AnchoredLineValues $lines "Evidence"
    $missingEvidenceReferences = @($evidenceValues | Where-Object { (Test-RealEvidence $_) -and -not (Test-EvidenceReferenceExists $_) })
    foreach ($missingReference in $missingEvidenceReferences) {
        $script:violations.Add("Gray observation evidence reference does not exist. Evidence reference does not exist: $missingReference")
    }
    $invalidMonitoringEvidenceReferences = @($evidenceValues | Where-Object { (Test-RealEvidence $_) -and (Test-EvidenceReferenceExists $_) -and -not (Test-GrayMonitoringEvidenceReferencePass $_) })
    foreach ($invalidReference in $invalidMonitoringEvidenceReferences) {
        $script:violations.Add("Gray observation repo-local evidence must be a reviewed monitoring or incident-review PASS packet with validated IncidentQueryEvidence content: $invalidReference")
    }
    $hasEvidence = ($evidenceValues | Where-Object { (Test-RealEvidence $_) -and (Test-EvidenceReferenceExists $_) -and (Test-GrayMonitoringEvidenceReferencePass $_) } | Select-Object -First 1) -ne $null

    return $hasPassStatus `
        -and $hasGrayReleaseId `
        -and $hasParseableTimes `
        -and $hasFourteenCalendarDays `
        -and $hasObservationEndedAtNotFuture `
        -and $hasGrayStartedAtNotAfterObservationStartedAt `
        -and $hasRequiredWindowText `
        -and $hasZeroP0P1 `
        -and $hasEvidence
}

function Add-Gate(
    [string]$Name,
    [string]$Path,
    [string]$RequiredEvidence,
    [bool]$IsPass
) {
    $status = if ($IsPass) { "PASS" } else { "FAIL" }
    $packetStatus = if (Test-Path $Path) { "FOUND" } else { "MISSING" }
    Add-Line "| $Name | $status | $packetStatus | $Path | $RequiredEvidence |"

    if ($packetStatus -eq "MISSING") {
        $script:violations.Add("$Name evidence packet is MISSING.")
    }

    if (-not $IsPass) {
        $script:violations.Add("$Name release gate is not PASS.")
    }
}

function Add-DeferredGate(
    [string]$Name,
    [string]$Path,
    [string]$RequiredEvidence,
    [string]$Reason
) {
    $packetStatus = if (Test-Path $Path) { "FOUND" } else { "MISSING" }
    Add-Line "| $Name | DEFERRED_BY_OWNER | $packetStatus | $Path | $RequiredEvidence |"
    $script:deferredGates.Add("$Name deferred by owner: $Reason")

    if ($packetStatus -eq "MISSING") {
        $script:violations.Add("$Name evidence packet is MISSING.")
    }
}

$reportDirectory = Split-Path -Parent $ReportPath
if (-not [string]::IsNullOrWhiteSpace($reportDirectory)) {
    New-Item -ItemType Directory -Force -Path $reportDirectory | Out-Null
}

$hostedCi = Read-TextOrEmpty $HostedCiReportPath
$staging = Read-TextOrEmpty $StagingReportPath
$attackChain = Read-TextOrEmpty $AttackChainReportPath
$securitySignoff = Read-TextOrEmpty $SecuritySignoffPath
$grayObservation = Read-TextOrEmpty $GrayObservationReportPath

$script:violations = New-Object System.Collections.Generic.List[string]
$script:deferredGates = New-Object System.Collections.Generic.List[string]
$script:reportLines = @()

Add-Line "# Release gate audit"
Add-Line ""
Add-Line "- GeneratedAt: $(Get-Date -Format o)"
Add-Line "- Scope: v1.0.0 B-track hard release gates"
Add-Line ""
Add-Line "## Gate summary"
Add-Line ""
Add-Line "- Evidence packet status: FOUND or MISSING"
Add-Line ""
Add-Line "| Gate | Status | Evidence packet status | Evidence packet | Required evidence |"
Add-Line "| --- | --- | --- | --- | --- |"
Add-Gate "Hosted CI" $HostedCiReportPath "Hosted runner RunUrl, RunId, release repository, release branch, head SHA, and job summary" (Test-HostedCiEvidencePass $hostedCi)
Add-Gate "PostgreSQL/staging" $StagingReportPath "Production environment, PostgreSQL connection, Docker dependencies, EF migrations, API startup, /live, and /ready" (Test-StagingEvidencePass $staging)
Add-Gate "Attack Chain A/B/C" $AttackChainReportPath "VERIFIED status, verifier, VerifiedAt, and Attack Chain A/B/C Manual verification PASS with non-placeholder evidence" (Test-AttackChainEvidencePass $attackChain)
Add-Gate "Security signoff" $SecuritySignoffPath "Human SIGNED decision, signer, SignedAt, evidence, self-assessment, and Attack Chain A/B/C PASS" (Test-SecuritySignoffEvidencePass $securitySignoff)
if ($DeferGrayObservation) {
    Add-DeferredGate "Gray observation" $GrayObservationReportPath "Deferred owner decision; original strict gate still requires PASS gray release id, observation timestamps, 14 calendar days, P0/P1=0, and evidence" "2026-06-13 owner decision to skip the 14-day gray observation wait for current follow-up work."
} else {
    Add-Gate "Gray observation" $GrayObservationReportPath "PASS gray release id, observation timestamps, 14 calendar days, P0/P1=0, and evidence" (Test-GrayObservationEvidencePass $grayObservation)
}

$result = if ($script:violations.Count -eq 0 -and $script:deferredGates.Count -gt 0) {
    "PASS_WITH_DEFERRED_GRAY_OBSERVATION"
} elseif ($script:violations.Count -eq 0) {
    "PASS"
} else {
    "FAIL"
}

Add-Line ""
Add-Line "## Gate"
Add-Line ""
Add-Line "- Result: $result"

if ($script:deferredGates.Count -gt 0) {
    Add-Line ""
    Add-Line "## Deferred Gates"
    Add-Line ""
    foreach ($deferredGate in $script:deferredGates) {
        Add-Line "- $deferredGate"
    }
    Add-Line ""
    Add-Line "This report is allowed to continue follow-up work after an explicit owner deferral, but it is not a strict v1.0.0 final release PASS."
}

if ($script:violations.Count -gt 0) {
    Add-Line ""
    Add-Line "## Violations"
    Add-Line ""
    foreach ($violation in $script:violations) {
        Add-Line "- $violation"
    }
    Add-Line ""
    Add-Line "This report cannot close the v1.0.0 release gate."
}

Set-Content -Path $ReportPath -Value $script:reportLines -Encoding UTF8
Write-Host "Release gate audit report: $ReportPath"

if ($result -eq "FAIL") {
    throw "Release gate audit failed. See $ReportPath."
}
