# 2026-06-21 Changelog - Staging EF Tools Aligned Recheck

## Changed

- Reran staging rehearsal after aligning `dotnet-ef` to EF Core `10.0.9`.
- Generated `_docs/_reports/staging-rehearsal-20260621-5003-ef-tools-aligned-pass.md`.
- Generated `_docs/_reports/release-gate-audit-20260621-v1-head-staging-ef-tools-aligned-deferred-gray.md`.
- Updated phase-one matrix and repo-local CC plan bridge to use the EF-tools-aligned staging packet as the current staging evidence.
- Updated `PhaseOneMatrix_ShouldReflectCurrentReleaseBoundaryEvidence` to require the aligned staging/release-gate evidence.

## Verification

```text
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\run-staging-rehearsal.ps1 -ReportPath _docs\_reports\staging-rehearsal-20260621-5003-ef-tools-aligned-pass.md -ApiBaseUrl http://localhost:5003 -ImagePullMode Missing -DockerPullTimeoutSeconds 60 -IncludeRescheduleProbe -IncludeCommitmentProbe
```

Result: PASS; no EF tools/runtime version-skew warning found.

```text
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\run-release-gate-audit.ps1 -ReportPath _docs\_reports\release-gate-audit-20260621-v1-head-staging-ef-tools-aligned-deferred-gray.md -HostedCiReportPath _docs\_reports\hosted-ci-20260621-v1-head-pass.md -StagingReportPath _docs\_reports\staging-rehearsal-20260621-5003-ef-tools-aligned-pass.md -AttackChainReportPath _docs\_reports\attack-chain-verification-20260611-manual-verified.md -SecuritySignoffPath _docs\_review\20260607-security-signoff.md -GrayObservationReportPath _docs\_reports\gray-observation-latest.md -DeferGrayObservation
```

Result: PASS_WITH_DEFERRED_GRAY_OBSERVATION.

```text
dotnet test src\tests\MES.ArchitectureTests\MES.ArchitectureTests.csproj --filter "FullyQualifiedName~PhaseOneMatrix_ShouldReflectCurrentReleaseBoundaryEvidence" --no-restore /p:SkipFrontendBuildCopy=true
```

Result: PASS, 1/1.

## Boundary

- This refresh supersedes the earlier 2026-06-21 staging packet that still contained the EF tools/runtime warning.
- Strict final v1.0.0 PASS remains unclaimed while gray observation is deferred.
