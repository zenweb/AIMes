# Schedule task detail double-click success evidence - 2026-06-22

## Scope
- Covered the Scheduler Pro Workbench task double-click path.
- Double-clicking a scheduled task should use the same backend detail load as a single click.

## Change
- Added a focused unit test for the `task-dbl-click` event from the Gantt chart.

## Evidence
- `npm run test:unit -- tests/unit/schedule-board.test.ts -t "double-click"` passed, 1 focused test.
- `npm run test:unit -- tests/unit/schedule-board.test.ts` passed, 48 tests.
- `npm run test:unit` passed, 118 files / 1248 tests.

## Result
- PASS. Double-clicking task `item-1` calls `getWorkOrderById('wo-1')`.
- PASS. Detail panel displays backend order `WO-001-DBLCLICK` with no error.
