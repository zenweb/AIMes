# 2026-06-19 Offline Demo Purchase List Quiet Fallback

## Change
- PurchaseBoard now treats `OfflineDemoApiError` from the initial `/api/v1/purchase` load as an intentional offline-demo skip.
- Offline demo still renders local purchase order fallback data, but no longer exposes the technical backend-skip message in the UI.
- Ordinary backend failures remain fail-loud and continue to show the existing purchase list fallback alert.

## Evidence
- RED verified:
  - `npm run test:unit -- tests/unit/purchase-board.test.ts -t "quietly shows demo purchase"` failed because an alert was still rendered.
- GREEN verified:
  - `npm run test:unit -- tests/unit/purchase-board.test.ts -t "quietly shows demo purchase"`: 1 passed.
  - `npm run test:unit -- tests/unit/purchase-board.test.ts -t "initial purchase list load falls back"`: 1 passed.
  - `npm run test:unit -- tests/unit/purchase-board.test.ts`: 37 passed.
  - Offline demo regression package: 21 files passed, 449 tests passed.
  - `npm run build`: passed.
- Real browser evidence at `http://127.0.0.1:4173/scheduling/purchase?offlineDemo=1`:
  - `hasBackendSkip: false`
  - `hasPurchaseListFailure: false`
  - `hasPurchaseRefreshFailure: false`
  - `alertCount: 0`
  - `optionCount: 4`
  - `hasDemoPurchase: true`

