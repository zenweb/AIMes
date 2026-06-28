# 2026-06-21 Production WO-013 Backend Scan Seed

## Changed
- Added an idempotent demo seed for `WO-013` with `OP-10 / 淬火` so the personnel qualification release chain can be verified through the real production scan API.
- Updated production scan behavior to reuse an existing operation execution for a scanned work order before creating a default execution.
- Added explicit `Aimes:SeedDemoDataOnStartup` support and enabled it in `docker-compose.yml` for the local demo stack, keeping Production migration behavior unchanged.

## Evidence
- RED: `ProductionControllerTests.DemoSeed_ShouldKeepWo013HeatTreatmentScannableWhenOtherWorkOrdersAlreadyExist` returned `400`, then returned `OP-10` with operation name `OP-10`.
- GREEN: `dotnet test src\tests\MES.Tests.Unit\MES.Tests.Unit.csproj --filter "FullyQualifiedName~OperationServiceTests"` passed, 4 tests.
- GREEN: `dotnet test src\tests\MES.Tests.Unit\MES.Tests.Unit.csproj --filter "FullyQualifiedName~DatabaseStartupValidatorTests"` passed, 5 tests.
- GREEN: `dotnet test src\tests\MES.Tests.Integration\MES.Tests.Integration.csproj --filter "FullyQualifiedName~ProductionControllerTests"` passed, 6 tests.
- Runtime: `POST http://127.0.0.1:5003/api/v1/production/scan` with `code=WO-013` returned `200`, `operationCode=OP-10`, `operationName=淬火`.
- Browser: `/scheduling/production?scanCode=WO-013` shows `WO-013`, `OP-10 · 淬火`, and `人员: EMP-006 替班已确认` with no fallback/offline-skip/scan-error text.

## 2026-06-21 Current-State Recheck

- Rechecked backend integration evidence on the current dirty worktree: `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --filter FullyQualifiedName~ProductionControllerTests --no-restore` passed, 6/6.
- Rechecked real-browser production personnel handoff: `npm run test:e2e -- tests/e2e/production.spec.ts -g "热处理开工读取人员替班建议并写回 OTD 证据"` passed, 1/1.
- No code change was required in this recheck; the current implementation still proves `WO-013` can flow through backend-backed production scan and personnel reassignment evidence.
