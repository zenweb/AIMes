# 2026-06-19 Offline Demo Barcode Label Quiet Fallback

## Change
- BarcodePrintBoard now treats `OfflineDemoApiError` from the initial `/api/v1/inventory` load as an intentional offline-demo skip.
- Offline demo still renders local barcode label fallback data, but no longer exposes the technical backend-skip message in the UI.
- Ordinary backend failures remain fail-loud and continue to show the existing label list fallback alert.

## Evidence
- Real browser reproduction before the fix at `http://127.0.0.1:4173/scheduling/barcode?offlineDemo=1`:
  - `hasBackendSkip: true`
  - `hasBarcodeListFailure: true`
  - `hasInventoryPath: true`
  - `alertCount: 1`
  - `labelCount: 4`
- RED verified:
  - `npm run test:unit -- tests/unit/barcode-print-board.test.ts -t "quietly shows demo labels"` failed because an alert was still rendered.
- GREEN verified:
  - `npm run test:unit -- tests/unit/barcode-print-board.test.ts -t "quietly shows demo labels"`: 1 passed.
  - `npm run test:unit -- tests/unit/barcode-print-board.test.ts -t "initial inventory list cannot be loaded"`: 1 passed.
  - `npm run test:unit -- tests/unit/barcode-print-board.test.ts`: 9 passed.
  - Offline demo regression package: 22 files passed, 458 tests passed.
  - `npm run build`: passed.
- Real browser evidence after rebuild at `http://127.0.0.1:4173/scheduling/barcode?offlineDemo=1`:
  - `hasBackendSkip: false`
  - `hasBarcodeListFailure: false`
  - `hasInventoryPath: false`
  - `alertCount: 0`
  - `labelCount: 4`
  - `hasDemoBarcode: true`

