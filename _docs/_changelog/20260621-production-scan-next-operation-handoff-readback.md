# 2026-06-21 Production scan next-operation handoff readback

## Changed

- Added optional `NextOperation` to backend `OperationInfoDto`.
- Added operation repository readback for all executions in a work order and used it in `OperationService.ScanAsync` to return the downstream operation.
- Seeded WO-013 with `OP-20 / 回火` so heat-treatment barcode scan can prove downstream route context from backend data.
- Updated frontend `OperationInfoDto` and `ProductionBoard` to expand scanned operation chains from backend `nextOperation`.
- Restored barcode completion handoff evidence coverage to backend-backed `OP-20`, instead of relying on local demo operation maps.

## Evidence

- `dotnet test src\tests\MES.Tests.Unit\MES.Tests.Unit.csproj --filter "FullyQualifiedName~OperationServiceTests"` -> 5 passed.
- `dotnet test src\tests\MES.Tests.Integration\MES.Tests.Integration.csproj --filter "FullyQualifiedName~ProductionControllerTests"` -> 6 passed.
- `npm run test:unit -- tests/unit/production-board.test.ts` -> 41 passed.
- `npm run test:unit -- tests/unit/production-board.test.ts tests/unit/production-api.test.ts` -> 47 passed.
- `npm run build` -> passed.
- `docker compose up -d --build api` -> passed, API rebuilt and started on 5003.
- REST scan readback for `WO-013` returned `OP-10 / 淬火` and `nextOperation OP-20 / 回火`.
- Real browser check: `http://127.0.0.1:4173/scheduling/production?scanCode=WO-013` showed `WO-013`, `OP-10 / 淬火`, `OP-20 / 回火`, and `人员: EMP-006 替班已确认`; no offline demo or scan failure text.
- Screenshot: `src/frontend/output/playwright/production-wo013-next-operation-backend-readback.png`.
