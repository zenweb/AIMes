# Schedule task detail backend success evidence - 2026-06-22

## Scope
- Covered the Scheduler Pro Workbench task-detail success path.
- When an operator clicks a scheduled task, the detail panel should show backend work-order details while preserving local schedule explanation context.

## Change
- Added a focused unit test for successful `getWorkOrderById` after a Gantt task click.

## Evidence
- `npm run test:unit -- tests/unit/schedule-board.test.ts -t "backend work order details"` passed, 1 focused test.
- `npm run test:unit -- tests/unit/schedule-board.test.ts` passed, 47 tests.
- `npm run test:unit` passed, 118 files / 1247 tests.

## Result
- PASS. Task click calls `getWorkOrderById('wo-1')`.
- PASS. Detail panel displays backend order `WO-001-BACKEND` with no error while retaining the schedule explanation for `WO-001`.
