# 2026-06-14 Staging Reschedule Persistence Current

## Changed
- Re-ran PostgreSQL/staging rehearsal against the current local Docker environment with the reschedule persistence probe enabled.
- Verified the existing Scheduling drag/reschedule write path persists the patched window to PostgreSQL and reads the same window back through the API.
- Re-ran release gate audit using the new staging evidence while keeping gray observation owner-deferred.

## Verification
- `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/run-staging-rehearsal.ps1 -ReportPath _docs/_reports/staging-rehearsal-20260614-reschedule-persistence-current.md -ImagePullMode Missing -IncludeRescheduleProbe` -> Result: PASS.
- `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/run-release-gate-audit.ps1 -ReportPath _docs/_reports/release-gate-audit-20260614-after-reschedule-persistence.md -HostedCiReportPath _docs/_reports/hosted-ci-20260611-v1-pass.md -StagingReportPath _docs/_reports/staging-rehearsal-20260614-reschedule-persistence-current.md -AttackChainReportPath _docs/_reports/attack-chain-verification-20260611-manual-verified.md -SecuritySignoffPath _docs/_review/20260607-security-signoff.md -GrayObservationReportPath _docs/_reports/gray-observation-20260611-observing.md -DeferGrayObservation` -> PASS_WITH_DEFERRED_GRAY_OBSERVATION.
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --filter "FullyQualifiedName~SchedulingControllerTests|FullyQualifiedName~ScheduleRepositoryTests"` -> 66 passed, 0 failed, 0 skipped.

## Notes
- No production code changed.
- This closes current-state backend persistence evidence for the existing Scheduling reschedule path.
