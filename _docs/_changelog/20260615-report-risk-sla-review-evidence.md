# 2026-06-15 Changelog: Report risk SLA review evidence

## Changed
- Added a risk SLA review evidence block to the OTD review report so closed morning-review responsibility actions are visible on the report page.
- Added `ReportBoard` coverage for risk SLA review evidence in both the visible report and CSV report pack.
- Made the `risk-sla-review-sync` mock controllable in `report-board.test.ts`.

## Verification
- RED: `npm run test:unit -- tests/unit/report-board.test.ts -t "surfaces risk SLA closure"` failed because `.risk-sla-report` did not exist.
- GREEN: `npm run test:unit -- tests/unit/report-board.test.ts -t "surfaces risk SLA closure"`: 1 passed.
- `npm run test:unit -- tests/unit/report-board.test.ts`: 24 passed.
- `npm run test:unit -- tests/unit/risk-sla-review-sync.test.ts`: 5 passed.
- `npm run test:unit:coverage -- tests/unit/report-board.test.ts`: 24 passed; `ReportBoard.vue` lines `82.68%`.
