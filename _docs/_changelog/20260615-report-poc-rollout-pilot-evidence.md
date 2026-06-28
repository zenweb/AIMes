# 2026-06-15 Changelog: Report POC rollout and pilot evidence

## Changed
- Added `ReportBoard` coverage for backend-first POC rollout package evidence in the visible report and CSV report pack.
- Added `ReportBoard` coverage for backend-first POC pilot-run evidence in the visible report and CSV report pack.
- No production code changed; the existing implementation already rendered and exported the evidence correctly.

## Verification
- `npm run test:unit -- tests/unit/report-board.test.ts -t "surfaces POC rollout and pilot run evidence in the report and CSV pack"`: 1 passed.
- `npm run test:unit -- tests/unit/report-board.test.ts`: 26 passed.
- `npm run test:unit:coverage -- tests/unit/report-board.test.ts`: 26 passed; `ReportBoard.vue` lines `87.05%`.
