# 2026-06-21 Issue - WO-013 Production Scan Used Frontend Fallback

## Problem
`POST /api/v1/production/scan` with `code=WO-013` returned `400 Operation or work order was not found` in the Docker stack. The production page could still render `WO-013` through frontend demo fallback, weakening the real-browser evidence chain.

## Root Cause
- `DemoDataSeeder.SeedWorkOrdersAsync` returned early when any work order existed, so it did not backfill `WO-013` into an existing database.
- Docker compose runs the API as `Production`, and the startup validator did not run demo seeding in Production.
- When a work order did exist, scanning the work order code created a default execution from `RouteCode`, losing the seeded operation name.

## Fix
- Added idempotent `WO-013 / OP-10 / 淬火` seeding.
- Added `IOperationRepository.GetFirstExecutionByWorkOrderIdAsync` and reused existing executions during work-order scans.
- Added explicit `Aimes:SeedDemoDataOnStartup` for local demo startup recovery.

## 2026-06-21 Current-State Recheck
- Backend integration PASS: `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --filter FullyQualifiedName~ProductionControllerTests --no-restore` 6/6.
- Real-browser PASS: `npm run test:e2e -- tests/e2e/production.spec.ts -g "热处理开工读取人员替班建议并写回 OTD 证据"` 1/1.
- Status remains closed for this issue; broader release gates remain separate.
