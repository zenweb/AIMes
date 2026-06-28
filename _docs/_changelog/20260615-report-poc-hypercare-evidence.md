# 2026-06-15 Changelog: Report POC Hypercare evidence

## Changed
- Updated `ReportBoard` so an existing backend Hypercare acceptance record shows the active Hypercare summary panel even when the pilot-run record is not present locally.
- Added `ReportBoard` coverage for POC Hypercare acceptance evidence in the visible report and CSV report pack.
- Made the `poc-hypercare-sync` read mock controllable in `report-board.test.ts`.

## Verification
- RED: `npm run test:unit -- tests/unit/report-board.test.ts -t "surfaces POC Hypercare acceptance"` failed because `.poc-hypercare-panel.active` was hidden without local `pocPilotRun`.
- GREEN: `npm run test:unit -- tests/unit/report-board.test.ts -t "surfaces POC Hypercare acceptance"`: 1 passed.
- `npm run test:unit -- tests/unit/report-board.test.ts`: 25 passed.
- `npm run test:unit -- tests/unit/poc-hypercare-sync.test.ts`: 6 passed.
- `npm run test:unit:coverage -- tests/unit/report-board.test.ts`: 25 passed; `ReportBoard.vue` lines `84.36%`.
