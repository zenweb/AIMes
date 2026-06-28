# 2026-06-19 Changelog: Scanner evidence readback omission

## Changed
- Added fail-loud handling after barcode scan evidence confirmation when backend readback omits the just-written record.
- `ScannerBoard` now keeps the local scan evidence visible and synced when the backend returns a stale or incomplete evidence list.
- The alert names the missing scan code so the operator can retry or inspect the backend evidence chain without losing the local confirmation.

## Evidence
- RED: `npm run test:unit -- tests/unit/scanner-board.test.ts -t "keeps local scan evidence visible and alerts when backend readback omits the written record"` first failed because no alert was rendered and the evidence panel returned to unconfirmed.
- GREEN: targeted test passed.
- Component suite: `npm run test:unit -- tests/unit/scanner-board.test.ts` passed, 14 tests.
- Full frontend coverage: `npm run test:unit:coverage` passed, 111 files / 1108 tests.
- Lint: `npm run lint` passed.
- Build: `npm run build` passed.

## Follow-up API Contract Slice
- Added `writeBarcodeScanEvidenceRecordAndReadBack` so release/staging evidence can await backend persistence and verify the freshly written barcode scan record is returned by readback.
- Kept the existing `writeBarcodeScanEvidenceRecord` best-effort behavior unchanged for current scanner UI flows.
- Verification:
  - RED: `npm run test:unit -- tests/unit/barcode-scan-evidence-sync.test.ts` failed because `writeBarcodeScanEvidenceRecordAndReadBack` did not exist.
  - GREEN: `npm run test:unit -- tests/unit/barcode-scan-evidence-sync.test.ts` passed, 9 tests.
  - Hardened the helper test to verify the backend-confirmed record also refreshes the local OTD evidence-chain trace.
  - Adjacent component: `npm run test:unit -- tests/unit/scanner-board.test.ts` passed, 15 tests.
  - API helper: `npm run test:unit -- tests/unit/execution-evidence-api.test.ts` passed, 2 tests.
  - `npm run lint` passed.
  - `npm run build` passed.

## Release Gate Note
- Strict v1.0.0 still depends on first gray observation and the two-week no P0/P1 window.
