# 2026-06-19 Plan: Scanner evidence readback omission

## Success Criteria
- A successful barcode scan evidence write must remain visible even if backend readback omits the just-written record.
- The UI must fail loud with a specific scan-code message instead of silently showing the unconfirmed state.
- Existing scanner guidance, routing, startup refresh failure, camera handling, and successful backend readback behavior must keep passing.

## Execution
- Write a RED unit test for backend readback omission after scan evidence confirmation.
- Add minimal readback validation in `ScannerBoard`.
- Run targeted test, Scanner component suite, full frontend coverage, lint, and production build.

## Result
- Completed.
- Verification passed:
  - `npm run test:unit -- tests/unit/scanner-board.test.ts -t "keeps local scan evidence visible and alerts when backend readback omits the written record"`
  - `npm run test:unit -- tests/unit/scanner-board.test.ts`
  - `npm run test:unit:coverage`
  - `npm run lint`
  - `npm run build`

## Follow-up API Contract Plan
- Success criteria: release/staging verification can call a single helper that writes barcode scan evidence, waits for backend persistence, then fails loud if backend readback omits the written record.
- Scope: `barcode-scan-evidence-sync.ts` and its unit test only; no Scanner UI behavior change.
- Result:
  - Added `writeBarcodeScanEvidenceRecordAndReadBack`.
  - Preserved best-effort `writeBarcodeScanEvidenceRecord`.
  - Verified targeted helper, scanner component, execution evidence API tests, lint, and production build.
  - Added a guard that backend-confirmed readback also refreshes the local OTD evidence-chain trace.
