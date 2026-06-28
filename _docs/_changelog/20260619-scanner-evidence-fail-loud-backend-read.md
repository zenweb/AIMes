# 2026-06-19 Changelog: Scanner evidence fail-loud backend read

## Changed
- Added a fail-loud option to barcode scan evidence backend reads while preserving the default optional-evidence fallback.
- `ScannerBoard` now requests fail-loud backend reads for startup refresh and post-confirmation readback.
- This makes scanner evidence refresh alerts correspond to the real API path instead of only unit-test mocks.

## Evidence
- RED: `npm run test:unit -- tests/unit/barcode-scan-evidence-sync.test.ts -t "surfaces backend lookup failures when fail-loud scanner evidence is requested"` first failed because the function resolved local fallback instead of rejecting.
- GREEN: targeted test passed.
- Scanner component suite: `npm run test:unit -- tests/unit/scanner-board.test.ts` passed, 14 tests.
- API contract suite: `npm run test:unit -- tests/unit/execution-evidence-api.test.ts` passed, 2 tests.
- Utility suite: `npm run test:unit -- tests/unit/barcode-scan-evidence-sync.test.ts` passed, 8 tests.
- Full frontend coverage: `npm run test:unit:coverage` passed, 111 files / 1109 tests.
- Lint: `npm run lint` passed.
- Build: `npm run build` passed.

## Release Gate Note
- Strict v1.0.0 still depends on first gray observation and the two-week no P0/P1 window.
