# 2026-06-19 Offline Demo Scanner Evidence Quiet Fallback

## Change
- ScannerBoard now treats `OfflineDemoApiError` from startup `/api/v1/scheduling/barcode-scan-evidence` refresh as an intentional offline-demo skip.
- Offline demo keeps the scanner guidance and manual scan entry available without exposing the technical backend-skip message in the UI.
- Ordinary backend evidence refresh failures remain fail-loud and continue to show the existing startup evidence refresh alert.

## Evidence
- Real browser reproduction before the fix at `http://127.0.0.1:4173/scheduling/scanner?offlineDemo=1`:
  - `hasBackendSkip: true`
  - `hasScannerStartupFailure: true`
  - `hasBarcodeEvidencePath: true`
  - `alertCount: 1`
  - `hasScannerGuidance: true`
  - `hasManualInput: true`
- RED verified:
  - `npm run test:unit -- tests/unit/scanner-board.test.ts -t "quietly keeps local scan evidence"` failed because an alert was still rendered.
- GREEN verified:
  - `npm run test:unit -- tests/unit/scanner-board.test.ts -t "quietly keeps local scan evidence"`: 1 passed.
  - `npm run test:unit -- tests/unit/scanner-board.test.ts -t "startup backend evidence refresh fails"`: 1 passed.
  - `npm run test:unit -- tests/unit/scanner-board.test.ts`: 15 passed.
  - Offline demo regression package: 23 files passed, 473 tests passed.
  - `npm run build`: passed.
- Real browser evidence after rebuild at `http://127.0.0.1:4173/scheduling/scanner?offlineDemo=1`:
  - `hasBackendSkip: false`
  - `hasScannerStartupFailure: false`
  - `hasBarcodeEvidencePath: false`
  - `alertCount: 0`
  - `hasScannerGuidance: true`
  - `hasManualInput: true`
  - `hasHelp: true`

