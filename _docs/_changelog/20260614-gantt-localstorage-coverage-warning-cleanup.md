# 20260614 Gantt localStorage coverage warning cleanup

## Change
- Wrapped `GanttChart` explicit live-mode localStorage access so an unavailable browser storage handle keeps the real dhtmlx path usable.
- Updated `gantt-chart.test.ts` to install the repo-local memory localStorage stub before each test.
- Added regression coverage for the case where the `window.localStorage` handle itself is unavailable.

## Evidence
- `npm run test:unit -- tests/unit/gantt-chart.test.ts`: 23 passed.
- `NODE_OPTIONS=--trace-warnings npm run test:unit:coverage -- tests/unit/gantt-chart.test.ts`: 23 passed; no `--localstorage-file` warning.
- `NODE_OPTIONS=--trace-warnings npm run test:unit:coverage`: 106 files / 787 tests passed; global line coverage 84.29%; no `--localstorage-file` warning.

## Audit Note
- Do not run multiple `test:unit:coverage` commands in parallel. Vitest uses the same `coverage/.tmp` directory and parallel coverage runs can delete each other's temp files.
