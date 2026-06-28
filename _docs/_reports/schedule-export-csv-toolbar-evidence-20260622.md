# Schedule export CSV toolbar evidence - 2026-06-22

## Scope
- Covered the Scheduler Pro Workbench toolbar CSV export path.
- Export is an existing operator-facing function and should prove it uses the current schedule rows rather than a static placeholder.

## Change
- Exposed the `downloadCsv` mock in `schedule-board.test.ts`.
- Added a focused unit test that triggers the toolbar `export-csv` event.

## Evidence
- `npm run test:unit -- tests/unit/schedule-board.test.ts -t "exports the current schedule plan"` passed, 1 focused test.
- `npm run test:unit -- tests/unit/schedule-board.test.ts` passed, 46 tests.
- `npm run test:unit` passed, 118 files / 1246 tests.

## Result
- PASS. The toolbar export calls `downloadCsv` with `排产计划.csv`.
- PASS. The exported headers and rows include the current schedule plan task `WO-001` and progress `100%`.
