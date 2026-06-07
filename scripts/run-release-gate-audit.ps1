param(
    [string]$ReportPath = "_docs/_reports/release-gate-audit-latest.md",
    [string]$HostedCiReportPath = "_docs/_reports/hosted-ci-20260602.md",
    [string]$StagingReportPath = "_docs/_reports/staging-rehearsal-20260602-local.md",
    [string]$AttackChainReportPath = "_docs/_reports/attack-chain-verification-20260602.md",
    [string]$SecuritySignoffPath = "_docs/_review/20260602-security-signoff.md",
    [string]$GrayObservationReportPath = "_docs/_reports/gray-observation-20260602.md"
)

$ErrorActionPreference = "Stop"
$failResultToken = "Result: FAIL"

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

function Test-NoBlockingSecuritySignoffText([string]$Text) {
    return -not ($Text -match '\b(PENDING|UNSIGNED|FAIL)\b')
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
    $hasEvidence = (Get-AnchoredLineValues $sectionLines "Evidence" | Where-Object { Test-RealEvidence $_ } | Select-Object -First 1) -ne $null
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
    $evidenceCount = (Get-AnchoredLineValues $lines "Evidence" | Where-Object { Test-RealEvidence $_ }).Count

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
    $hasEvidence = (Get-AnchoredLineValues $lines "Evidence" | Where-Object { Test-RealEvidence $_ } | Select-Object -First 1) -ne $null

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
Add-Gate "Hosted CI" $HostedCiReportPath "Hosted runner RunUrl, RunId, and job summary" (Test-HostedCiEvidencePass $hostedCi)
Add-Gate "PostgreSQL/staging" $StagingReportPath "Real staging rehearsal with migrations and /live /ready PASS" (Test-StagingEvidencePass $staging)
Add-Gate "Attack Chain A/B/C" $AttackChainReportPath "Human verifier, timestamp, and A/B/C evidence" (Test-AttackChainEvidencePass $attackChain)
Add-Gate "Security signoff" $SecuritySignoffPath "Human signer changes Status/Decision to SIGNED with evidence" (Test-SecuritySignoffEvidencePass $securitySignoff)
Add-Gate "Gray observation" $GrayObservationReportPath "First gray release plus 14 calendar days with P0/P1 = 0" (Test-GrayObservationEvidencePass $grayObservation)

$result = if ($script:violations.Count -eq 0) { "PASS" } else { "FAIL" }

Add-Line ""
Add-Line "## Gate"
Add-Line ""
Add-Line "- Result: $result"

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

if ($result -ne "PASS") {
    throw "Release gate audit failed. See $ReportPath."
}
