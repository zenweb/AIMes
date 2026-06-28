# 2026-06-16 Scanner API Payload Shape Fail Loud

- Fixed `ScannerBoard.vue` scan API handling so successful HTTP responses with non-scan payloads no longer become UI results.
- Added scan result shape validation for `type`, `id`, `code`, and `name`.
- Non-scan payloads now show `扫码查询返回非扫码结果载荷`, keep the scan result empty, and avoid writing scan history.
- Kept offline demo fallback behavior for real lookup failures unchanged.

## Verification

- Red test first:
  - `npm run test:unit -- tests/unit/scanner-board.test.ts -t "fails loud when the scan API returns a non-scan payload" --reporter=dot`
  - Expected failure observed: malformed API payload escaped into render and caused `Cannot read properties of undefined (reading 'toLowerCase')` without an alert.
- Green targeted test:
  - Same command passed: `1 passed | 11 skipped`.
- Targeted coverage:
  - `npm run test:unit:coverage -- tests/unit/scanner-board.test.ts --reporter=dot --coverage.reporter=text`
  - `12 passed`.
  - `ScannerBoard.vue`: statements `87.17%`, branches `71.42%`, functions `78.37%`, lines `90.78%`.
- Full frontend coverage:
  - `npm run test:unit:coverage -- --reporter=dot --coverage.reporter=text`
  - `111 files / 1060 tests passed`.
  - Totals: statements `89.5%`, branches `76.95%`, functions `89.54%`, lines `92.63%`.
