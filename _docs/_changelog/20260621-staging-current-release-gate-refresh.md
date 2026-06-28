# 2026-06-21 Changelog - Staging Current Release Gate Refresh

## Changed

- Generated `_docs/_reports/staging-rehearsal-20260621-5003-current-pass.md` using API `http://localhost:5003`.
- Reran PostgreSQL/staging with Docker Desktop Linux engine, local dependency images, EF migrations, `/live`, `/ready`, reschedule persistence probe, and commitment persistence probe.
- Generated `_docs/_reports/release-gate-audit-20260621-v1-head-staging-current-deferred-gray.md` using the latest hosted CI and staging packets.
- Updated the phase-one matrix and repo-local CC plan bridge to cite the 2026-06-21 staging packet and latest aggregate release-gate packet.
- Updated `PhaseOneMatrix_ShouldReflectCurrentReleaseBoundaryEvidence` for the latest staging/release-gate anchors.

## Verification

```text
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\run-staging-rehearsal.ps1 -ReportPath _docs\_reports\staging-rehearsal-20260621-5003-current-pass.md -ApiBaseUrl http://localhost:5003 -ImagePullMode Missing -DockerPullTimeoutSeconds 60 -IncludeRescheduleProbe -IncludeCommitmentProbe
```

Result: PASS.

```text
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\run-release-gate-audit.ps1 -ReportPath _docs\_reports\release-gate-audit-20260621-v1-head-staging-current-deferred-gray.md -HostedCiReportPath _docs\_reports\hosted-ci-20260621-v1-head-pass.md -StagingReportPath _docs\_reports\staging-rehearsal-20260621-5003-current-pass.md -AttackChainReportPath _docs\_reports\attack-chain-verification-20260611-manual-verified.md -SecuritySignoffPath _docs\_review\20260607-security-signoff.md -GrayObservationReportPath _docs\_reports\gray-observation-latest.md -DeferGrayObservation
```

Result: PASS_WITH_DEFERRED_GRAY_OBSERVATION.

```text
dotnet test src\tests\MES.ArchitectureTests\MES.ArchitectureTests.csproj --filter "FullyQualifiedName~PhaseOneMatrix_ShouldReflectCurrentReleaseBoundaryEvidence" --no-restore /p:SkipFrontendBuildCopy=true
```

Result: PASS, 1/1.

## Boundary

- Staging passed, but the EF tools output includes a non-blocking version warning: EF tools `9.0.0` are older than runtime `10.0.9`.
- Dirty local worktree changes are still not proven by hosted CI.
- Strict final v1.0.0 PASS remains unclaimed because gray observation is deferred.
