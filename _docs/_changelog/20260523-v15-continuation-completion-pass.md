# 2026-05-23 V1.5 Continuation Completion Pass

## What Changed

- Split the EF migration surface into a baseline persistence migration and a focused Agent decision migration.
- Added Agent trace and adoption feedback write-back from Scheduling Agent recommend/adopt flows.
- Added reject success, reject policy rejection, audit fields, feedback and query persistence integration coverage.
- Added `SchedulerAgentEventHandler` as a config-gated backend polling bridge for new work order, rush order and equipment failure triggers.
- Upgraded `scripts/run-ab-comparison.ps1` from smoke-only to deterministic JSON/Markdown report generation.
- Wired report/dashboard frontend surfaces to `src/frontend/public/reports/latest-ab-report.json` with demo fallback.
- Added V1.5 capability docs and demo recording script/subtitles draft.

## Verification

- `dotnet build src\backend\AIMes.slnx --no-restore -p:UseSharedCompilation=false`: passed.
- `dotnet test src\tests\MES.Tests.Integration\MES.Tests.Integration.csproj --no-build --filter "FullyQualifiedName~SchedulingControllerTests"`: 18 passed.
- `powershell -ExecutionPolicy Bypass -File scripts\run-ab-comparison.ps1`: passed, generated JSON/Markdown A/B reports.
- `npm run build`: passed.
- `npm run test:e2e -- production.spec.ts`: 21 passed.

## Remaining Risks

- Full Admin/Planner/Quality/Purchase/Maintenance execution matrix is still not implemented.
- Real PostgreSQL `database update` was not executed in this pass.
- Demo mp4 was not recorded; script and subtitles are ready.
