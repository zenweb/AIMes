# Schedule equipment row click guard evidence - 2026-06-22

## Scope
- Covered the Scheduler Pro Workbench guard for Gantt equipment group rows.
- Clicking an equipment/group row must not request a work-order detail or open a misleading detail panel.

## Change
- Added a focused unit test for clicking `eq-eq-1`, the equipment group task emitted by the Gantt chart.

## Evidence
- `npm run test:unit -- tests/unit/schedule-board.test.ts -t "equipment group clicks"` passed, 1 focused test.
- `npm run test:unit -- tests/unit/schedule-board.test.ts` passed, 49 tests.
- `npm run test:unit` passed, 118 files / 1249 tests.

## Result
- PASS. Equipment group clicks do not call `getWorkOrderById`.
- PASS. The order detail panel stays hidden and error-free.
