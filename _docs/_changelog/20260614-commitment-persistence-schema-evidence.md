# 2026-06-14 Commitment Persistence Schema Evidence

## Changed
- Expanded `agent_evidence_links.evidence_summary` from `varchar(1000)` to PostgreSQL `text`.
- Added a staging commitment persistence probe for OTD KPI commitment and outsourcing commitment packages.
- Re-ran staging rehearsal and release gate audit with the commitment persistence evidence.

## Root Cause
- Real PostgreSQL rejected full commitment package JSON when `evidence_summary` was limited to 1000 characters.
- Unit and integration coverage had validated API behavior, but the current staging probe exposed the provider-level schema limit.

## Verification
- `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/run-staging-rehearsal.ps1 -ReportPath _docs/_reports/staging-rehearsal-20260614-commitment-persistence-current.md -ImagePullMode Missing -IncludeCommitmentProbe` -> Result: PASS.
- Staging report applied migration `20260613195241_ExpandAgentEvidenceSummaryText`.
- Commitment probe verified OTD evidence rows = 1, outsourcing evidence rows = 1, OTD audit rows = 1, outsourcing audit rows = 1.
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --filter "FullyQualifiedName~OutsourcingCommitmentApi_ShouldUpsertQueryLatestListAndAuditBackendEvidence|FullyQualifiedName~OtdKpiCommitmentApi_ShouldUpsertQueryLatestAndAuditCommitmentPackages"` -> 2 passed.
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --no-build --filter "FullyQualifiedName~SchedulingControllerTests|FullyQualifiedName~ScheduleRepositoryTests"` -> 66 passed.
- Release gate audit: `_docs/_reports/release-gate-audit-20260614-after-commitment-persistence.md` -> PASS_WITH_DEFERRED_GRAY_OBSERVATION.

## Notes
- Gray observation remains owner-deferred/skipped, not strict final PASS.
