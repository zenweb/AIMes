# 2026-06-19 Offline Demo Production Workorders Quiet Fallback

## Change
- ProductionBoard now treats `OfflineDemoApiError` from initial `/api/v1/scheduling/workorders` loading as an intentional offline-demo skip.
- Offline demo still renders local production work order fallback data, but no longer exposes the technical backend-skip message in the UI.
- Ordinary backend failures remain fail-loud and continue to show the existing production work-order fallback alert.

## Evidence
- Real browser sweep found the leak before the fix at `http://127.0.0.1:4173/scheduling/production?offlineDemo=1`:
  - `hasBackendSkip: true`
  - `hasProductionLoadFailure: true`
  - `alertCount: 1`
  - Alert: `生产工单加载失败，已显示本地演示工单：Offline demo mode skipped backend request: /api/v1/scheduling/workorders`
- RED verified:
  - `npm run test:unit -- tests/unit/production-board.test.ts -t "quietly shows demo work orders"` failed because an alert was still rendered.
- GREEN verified:
  - `npm run test:unit -- tests/unit/production-board.test.ts -t "quietly shows demo work orders"`: 1 passed.
  - `npm run test:unit -- tests/unit/production-board.test.ts -t "work-order API is unavailable"`: 1 passed.
  - `npm run test:unit -- tests/unit/production-board.test.ts`: 39 passed.
  - Offline demo regression package: 24 files passed, 512 tests passed.
  - `npm run build`: passed.
- Real browser evidence after rebuild at `http://127.0.0.1:4173/scheduling/production?offlineDemo=1`:
  - `hasBackendSkip: false`
  - `hasProductionLoadFailure: false`
  - `hasWorkordersPath: false`
  - `alertCount: 0`
  - `workOrderCount: 7`
  - `firstWorkOrder: WO-001`
  - `hasDemoWorkOrder: true`

