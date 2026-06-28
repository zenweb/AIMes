# 2026-06-16 Scanner WorkOrder Context Routing Coverage

- Added focused unit evidence for `ScannerBoard.vue` work-order scan context routing.
- Verified a scanned work order exposes production and scheduling actions with the scanned `scanCode` query preserved.
- Verified the work-order evidence hint remains tied to shop-floor arrival and production start-check context.
- Production code was not changed; existing behavior was covered directly.

## Verification

- Targeted new test: `npm run test:unit -- tests/unit/scanner-board.test.ts -t "routes work-order scans" --reporter=dot`
  - Result: `1 passed | 9 skipped`.
- Targeted Scanner coverage: `npm run test:unit:coverage -- tests/unit/scanner-board.test.ts --reporter=dot --coverage.reporter=text`
  - Result: `1 file / 10 tests passed`.
  - `ScannerBoard.vue`: statements `87.23%`, branches `75.92%`, functions `77.77%`, lines `91.4%`.
- Full frontend coverage: `npm run test:unit:coverage -- --reporter=dot`
  - Result: `111 files / 1046 tests passed`.
  - Totals: statements `89.16%`, branches `76.28%`, functions `89.06%`, lines `92.32%`.
