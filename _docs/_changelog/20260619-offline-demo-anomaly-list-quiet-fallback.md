# 2026-06-19 Offline Demo Anomaly List Quiet Fallback

## Summary
- Fixed `/scheduling/anomaly?offlineDemo=1` so skipped anomaly-list backend reads no longer leak technical errors to users.
- Preserved fail-loud behavior for real anomaly-list backend failures.

## Changed
- `src/frontend/src/components/anomaly/AnomalyBoard.vue`
  - Detects `OfflineDemoApiError` when `/api/v1/anomaly` is skipped in offline demo mode.
  - Keeps local demo anomalies visible without pushing a startup alert.
- `src/frontend/tests/unit/anomaly-board.test.ts`
  - Added RED/GREEN regression coverage for quiet offline demo anomaly-list fallback.
  - Existing ordinary-failure alert coverage remains active.

## Evidence
- `npm run test:unit -- tests/unit/anomaly-board.test.ts` -> 22 passed.
- `npm run test:unit -- tests/unit/anomaly-board.test.ts tests/unit/dashboard-board.test.ts tests/unit/audit-log-board.test.ts tests/unit/audit-decision-replay-panel.test.ts tests/unit/quality-board.test.ts tests/unit/report-board.test.ts tests/unit/admin-board.test.ts tests/unit/employee-board.test.ts tests/unit/document-upload.test.ts tests/unit/customer-order-import-sync.test.ts tests/unit/quality-knowledge-sample-sync.test.ts tests/unit/login-page.test.ts tests/unit/auth.store.test.ts tests/unit/router-auth.test.ts` -> 326 passed.
- `npm run build` -> passed.
- Real browser:
  - `/scheduling/anomaly?offlineDemo=1`
  - `hasBackendSkip: false`
  - `alerts: []`
  - `optionCount: 4`
  - demo anomaly `CNC-001 主轴温升异常` visible.

## Additional Sweep Findings
- Still leaking backend skip text and queued for later slices:
  - `/scheduling/monitoring`
  - `/scheduling/bom`
  - `/scheduling/routing`
  - `/scheduling/equipment`
  - `/scheduling/inventory`
  - `/scheduling/purchase`
  - `/scheduling/barcode`
  - `/scheduling/scanner`
