# 2026-06-15 Changelog: Report quality CAPA CSV evidence

## Changed
- Added CAPA closure review action, root cause, evidence strength, and owner to the report CSV export.
- Added a focused `ReportBoard` unit test proving CAPA closure evidence is included in the CSV report pack.

## Verification
- RED: `npm run test:unit -- tests/unit/report-board.test.ts -t "exports quality CAPA closure review evidence"` failed because CSV only contained CAPA task, OTD impact, and trace rows.
- GREEN: `npm run test:unit -- tests/unit/report-board.test.ts -t "exports quality CAPA closure review evidence"`: 1 passed.
- `npm run test:unit -- tests/unit/report-board.test.ts`: 22 passed.
- `npm run test:unit -- tests/unit/quality-capa-sync.test.ts`: 4 passed.
- `npm run test:unit:coverage -- tests/unit/report-board.test.ts`: 22 passed; `ReportBoard.vue` lines `79.29%`.
