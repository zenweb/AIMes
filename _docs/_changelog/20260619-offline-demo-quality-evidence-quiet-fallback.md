# 2026-06-19 Offline Demo Quality Evidence Quiet Fallback

## Summary
- Fixed `offlineDemo=1` quality board startup so skipped backend reads no longer leak `Offline demo mode skipped backend request` to users.
- Covered quality inspections, anomaly list, and SPC trend analysis as independent startup reads.
- Preserved fail-loud behavior for real backend failures.

## Changed
- `src/frontend/src/components/quality/QualityBoard.vue`
  - `OfflineDemoApiError` from `getInspections()` now falls back to local inspection demo data without setting `qualityError`.
  - anomaly fallback no longer returns early from `onMounted`, so SPC still loads after offline anomaly fallback.
  - shared fallback helpers now back inspection/anomaly demo data.
- `src/frontend/tests/unit/quality-board.test.ts`
  - Added regression coverage for quiet offline inspection fallback.
  - Added regression coverage that SPC continues loading after quiet offline anomaly fallback.
  - Existing SPC/anomaly quiet fallback tests remain active.

## Evidence
- `npm run test:unit -- tests/unit/quality-board.test.ts` -> 35 passed.
- `npm run test:unit -- tests/unit/quality-board.test.ts tests/unit/report-board.test.ts tests/unit/admin-board.test.ts tests/unit/employee-board.test.ts tests/unit/document-upload.test.ts tests/unit/customer-order-import-sync.test.ts tests/unit/quality-knowledge-sample-sync.test.ts tests/unit/login-page.test.ts tests/unit/auth.store.test.ts tests/unit/router-auth.test.ts` -> 227 passed.
- `npm run build` -> passed.
- Real browser:
  - `http://127.0.0.1:4173/scheduling/quality?offlineDemo=1`
  - `hasBackendSkip: false`
  - `alerts: []`
  - `hasSpcChart: true`
  - screenshot: `20260619-offline-demo-quality-no-backend-skip-alert`
- Real browser report regression:
  - `http://127.0.0.1:4173/scheduling/report?offlineDemo=1`
  - `hasBackendSkip: false`
  - `alerts: []`
