# 2026-06-15 Changelog: Report quality MRB disposition coverage

## Changed
- Added `ReportBoard` coverage for quality MRB disposition evidence entering the OTD review report and CSV report pack.
- Made the `quality-mrb-disposition-sync` mock controllable in `report-board.test.ts`.

## Verification
- `npm run test:unit -- tests/unit/report-board.test.ts -t "surfaces quality MRB disposition"`: 1 passed.
- `npm run test:unit -- tests/unit/report-board.test.ts`: 23 passed.
- `npm run test:unit -- tests/unit/quality-mrb-disposition-sync.test.ts`: 6 passed.
- `npm run test:unit:coverage -- tests/unit/report-board.test.ts`: 23 passed; `ReportBoard.vue` lines `80.8%`.
