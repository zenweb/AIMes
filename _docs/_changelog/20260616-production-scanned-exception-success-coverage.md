# 2026-06-16 Production Scanned Exception Success Coverage

- Added unit regression coverage for `ProductionBoard.vue` scanned exception success closure.
- Locked the business intent that a scanned production exception must:
  - report the exception against the scanned operation;
  - write the production anomaly management event;
  - write scanned barcode anomaly OTD evidence;
  - write production anomaly OTD evidence;
  - keep the barcode context visible as `扫码异常待闭环`;
  - expose the anomaly trace in the production execution trace panel;
  - show the operator-facing success notification.
- No production component code was changed; the existing behavior was made auditable by regression evidence.

## Verification

- `npm run test:unit -- tests/unit/production-board.test.ts -t "writes scanned exception barcode evidence" --reporter=dot`
  - `1 passed | 34 skipped`
- `npm run test:unit:coverage -- tests/unit/production-board.test.ts --reporter=dot --coverage.reporter=text`
  - `1 file / 35 tests passed`
  - `ProductionBoard.vue`: statements `86.41%`, branches `81.78%`, functions `83.33%`, lines `89.31%`
- `npm run test:unit:coverage -- --reporter=dot`
  - `111 files / 1037 tests passed`
  - all files: statements `88.87%`, branches `76.15%`, functions `88.54%`, lines `92.07%`

## Notes

- This slice increased branch evidence rather than line evidence because the target code path was already partially touched by adjacent tests.
- Coverage commands were run sequentially to avoid the shared `coverage/.tmp` conflict.
