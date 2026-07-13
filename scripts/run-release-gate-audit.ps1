param(
    [string]$ReportPath = "_docs/_reports/release-gate-audit-latest.md",
    [string]$HostedCiReportPath = "_docs/_reports/hosted-ci-20260611-v1-pass.md",
    [string]$StagingReportPath = "_docs/_reports/staging-rehearsal-20260611-docker-restored.md",
    [string]$BackupRestoreReportPath = "_docs/_reports/postgresql-backup-restore-latest.md",
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
    $evidenceMatches = @($Value | Select-String -AllMatches -Pattern '(?:_docs|output)/[A-Za-z0-9._/-]+\.(?:md|png|jpg|jpeg|webp|json|txt|log|zip|html|pdf|csv)' | ForEach-Object { $_.Matches } | ForEach-Object { $_ })
    if ($evidenceMatches.Count -eq 0) {
        return $true
    }

    foreach ($evidenceMatch in $evidenceMatches) {
        $evidencePath = $evidenceMatch.Value.TrimEnd(',', ';', '.', ':', ')', ']')
        $relativePath = $evidencePath.Replace('/', [System.IO.Path]::DirectorySeparatorChar)
        $candidate = Join-Path $script:repositoryRoot $relativePath
        if (-not (Test-Path $candidate)) {
            return $false
        }
    }

    return $true
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

function Invoke-GitLines([string[]]$Arguments) {
    try {
        $output = & git -C $script:repositoryRoot @Arguments 2>&1
        return @{
            ExitCode = $LASTEXITCODE
            Lines = @($output)
        }
    } catch {
        return @{
            ExitCode = 1
            Lines = @($_.Exception.Message)
        }
    }
}

function Get-FirstAnchoredLineValue([string]$Text, [string]$Label) {
    $lines = $Text -split "`r?`n"
    return Get-AnchoredLineValues $lines $Label | Where-Object {
        -not [string]::IsNullOrWhiteSpace($_)
    } | Select-Object -First 1
}

function Test-GitCommitResolvable([string]$Sha) {
    if ([string]::IsNullOrWhiteSpace($Sha)) {
        return $false
    }

    $result = Invoke-GitLines @("cat-file", "-t", $Sha)
    return $result.ExitCode -eq 0 -and ($result.Lines | Select-Object -First 1) -eq "commit"
}

function Get-GitHeadSha() {
    $result = Invoke-GitLines @("rev-parse", "HEAD")
    if ($result.ExitCode -ne 0) {
        return ""
    }

    return $result.Lines | Select-Object -First 1
}

function Test-GitAncestor([string]$Ancestor, [string]$Descendant) {
    if ([string]::IsNullOrWhiteSpace($Ancestor) -or [string]::IsNullOrWhiteSpace($Descendant)) {
        return $false
    }

    $result = Invoke-GitLines @("merge-base", "--is-ancestor", $Ancestor, $Descendant)
    return $result.ExitCode -eq 0
}

function Get-GitPorcelainStatus([string]$Path) {
    $candidate = Join-Path $script:repositoryRoot $Path
    if (-not (Test-Path $candidate)) {
        return "not-present-at-diagnostic-time"
    }

    $result = Invoke-GitLines @("status", "--short", "--", $Path)
    if ($result.ExitCode -ne 0 -or $result.Lines.Count -eq 0) {
        return "clean"
    }

    return ($result.Lines -join "; ")
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

function Test-BackupRestoreEvidencePass([string]$Text) {
    if (-not (Test-AnchoredReportPass $Text)) {
        return $false
    }

    $requiredTokens = @(
        "Existing data volume is never modified by this check: true",
        "Custom-format dump created: true",
        "Disposable restore container completed: true"
    )
    foreach ($token in $requiredTokens) {
        if (-not $Text.Contains($token)) {
            return $false
        }
    }

    $lines = $Text -split "`r?`n"
    $tableLine = $lines | Where-Object { $_ -match '^- public tables: source=(\d+), restore=(\d+)\s*$' } | Select-Object -First 1
    $migrationLine = $lines | Where-Object { $_ -match '^- EF migrations: source=(\d+), restore=(\d+)\s*$' } | Select-Object -First 1
    if ($null -eq $tableLine -or $null -eq $migrationLine) {
        return $false
    }

    $tableMatch = [regex]::Match($tableLine, 'source=(\d+), restore=(\d+)')
    $migrationMatch = [regex]::Match($migrationLine, 'source=(\d+), restore=(\d+)')
    return $tableMatch.Success `
        -and $migrationMatch.Success `
        -and [int]$tableMatch.Groups[1].Value -gt 0 `
        -and [int]$tableMatch.Groups[1].Value -eq [int]$tableMatch.Groups[2].Value `
        -and [int]$migrationMatch.Groups[1].Value -gt 0 `
        -and [int]$migrationMatch.Groups[1].Value -eq [int]$migrationMatch.Groups[2].Value
}

function Add-EvidenceIntegrityDiagnostics() {
    $hostedCiCommitSha = Get-FirstAnchoredLineValue $hostedCi "CommitSha"
    $currentHeadSha = Get-GitHeadSha
    $hostedCiCommitResolvable = Test-GitCommitResolvable $hostedCiCommitSha
    $hostedCiAncestorOfHead = Test-GitAncestor $hostedCiCommitSha $currentHeadSha
    $headAncestorOfHostedCi = Test-GitAncestor $currentHeadSha $hostedCiCommitSha

    Add-Line ""
    Add-Line "## Evidence Integrity Diagnostics"
    Add-Line ""
    Add-Line "These diagnostics do not replace gate status. They expose local proof boundaries that can make a PASS packet weaker for the current dirty worktree."
    Add-Line ""
    Add-Line "- Hosted CI CommitSha: $hostedCiCommitSha"
    Add-Line "- Local HEAD: $currentHeadSha"
    Add-Line "- Hosted CI CommitSha locally resolvable as commit: $hostedCiCommitResolvable"
    Add-Line "- Hosted CI CommitSha ancestor of local HEAD: $hostedCiAncestorOfHead"
    Add-Line "- Local HEAD ancestor of Hosted CI CommitSha: $headAncestorOfHostedCi"
    Add-Line "- Hosted CI evidence git status: $(Get-GitPorcelainStatus $HostedCiReportPath)"
    Add-Line "- Release gate output git status: $(Get-GitPorcelainStatus $ReportPath)"
    Add-Line "- Staging evidence git status: $(Get-GitPorcelainStatus $StagingReportPath)"
    Add-Line "- Backup/restore evidence git status: $(Get-GitPorcelainStatus $BackupRestoreReportPath)"
    Add-Line "- Attack chain evidence git status: $(Get-GitPorcelainStatus $AttackChainReportPath)"
    Add-Line "- Security signoff evidence git status: $(Get-GitPorcelainStatus $SecuritySignoffPath)"
    Add-Line "- Gray observation evidence git status: $(Get-GitPorcelainStatus $GrayObservationReportPath)"

    $grayLines = $grayObservation -split "`r?`n"
    $grayStatus = Get-AnchoredLineValues $grayLines "Status" | Select-Object -First 1
    $grayObservationEndedAt = Get-AnchoredLineValues $grayLines "ObservationEndedAt" | Select-Object -First 1
    $grayIncidentCounts = ($grayLines | Where-Object {
        $_ -match '^- P0/P1 incident counts:\s*(.+?)\s*$' -or $_ -match '^P0/P1 incident counts:\s*(.+?)\s*$'
    } | ForEach-Object { $matches[1] } | Select-Object -First 1)
    Add-Line "- Gray observation status: $grayStatus"
    Add-Line "- Gray observation ended at: $grayObservationEndedAt"
    Add-Line "- Gray observation incident counts: $grayIncidentCounts"

    if (-not $hostedCiCommitResolvable) {
        Add-Line "- Integrity warning: hosted CI CommitSha is not locally resolvable; local audit cannot close the CI anchor."
    }

    if ($hostedCiCommitResolvable -and -not $hostedCiAncestorOfHead -and -not $headAncestorOfHostedCi) {
        Add-Line "- Integrity warning: hosted CI CommitSha and local HEAD are mutually non-ancestor; hosted CI proves the remote release head, not the current local dirty tree."
    }

    if ($grayIncidentCounts -match 'P0=-1;\s*P1=-1') {
        Add-Line "- Integrity warning: gray observation still uses sentinel incident counts; strict PASS requires real P0=0 and P1=0 monitoring evidence."
    }
}

$reportDirectory = Split-Path -Parent $ReportPath
if (-not [string]::IsNullOrWhiteSpace($reportDirectory)) {
    New-Item -ItemType Directory -Force -Path $reportDirectory | Out-Null
}

$hostedCi = Read-TextOrEmpty $HostedCiReportPath
$staging = Read-TextOrEmpty $StagingReportPath
$backupRestore = Read-TextOrEmpty $BackupRestoreReportPath
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
Add-Gate "PostgreSQL backup/restore" $BackupRestoreReportPath "Custom-format backup restored into an isolated PostgreSQL container with matching schema, migration, user, and audit counts" (Test-BackupRestoreEvidencePass $backupRestore)
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

Add-EvidenceIntegrityDiagnostics

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
