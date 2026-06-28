# 2026-06-19 Plan: Scanner evidence fail-loud backend read

## Success Criteria
- Scanner startup and post-confirmation backend evidence refreshes must surface backend failures.
- Existing optional evidence consumers must keep their fallback behavior.
- Scanner component behavior and execution evidence API contract tests must stay green.

## Execution
- Add a RED utility test for fail-loud barcode evidence backend lookup.
- Add `{ failLoud?: boolean }` to API and utility read paths.
- Update `ScannerBoard` to request fail-loud reads.
- Verify targeted, component, utility, API contract, full coverage, lint, and build.

## Result
- Completed.
- Verification passed:
  - `npm run test:unit -- tests/unit/barcode-scan-evidence-sync.test.ts -t "surfaces backend lookup failures when fail-loud scanner evidence is requested"`
  - `npm run test:unit -- tests/unit/scanner-board.test.ts`
  - `npm run test:unit -- tests/unit/execution-evidence-api.test.ts`
  - `npm run test:unit -- tests/unit/barcode-scan-evidence-sync.test.ts`
  - `npm run test:unit:coverage`
  - `npm run lint`
  - `npm run build`
