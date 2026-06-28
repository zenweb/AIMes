# Changelog: Gantt stale task click guard

Date: 2026-06-19

## Changed

- Hardened `GanttChart.vue` real dhtmlx task click and double-click handlers against stale task ids after schedule refresh or route transitions.
- When dhtmlx invokes a click callback for a task that no longer exists, the component now ignores it instead of throwing and breaking the scheduling view.
- Added focused unit coverage for stale click and double-click callbacks.

## Verification

- RED: `npx vitest run tests/unit/gantt-chart.test.ts --coverage.enabled=false -t "ignores stale dhtmlx task click callbacks after the schedule refresh removes a task"` failed with `Cannot read properties of undefined (reading 'parent')`.
- GREEN: the same targeted test passed after adding the stale task guard.
- `npx vitest run tests/unit/gantt-chart.test.ts --coverage.enabled=false` passed: 29 tests.
- `npm run test:unit:coverage` passed: 111 files / 1083 tests.
- Coverage totals: statements 89.71%, branches 77.15%, functions 89.92%, lines 92.83%.
- `npm run lint` passed.
