# Changelog: Gantt tooltip duration unit

Date: 2026-06-19

## Changed

- Corrected `GanttChart.vue` work-order tooltip duration display from days to hours.
- Added a regression test proving an explicit `08:00` to `20:00` work-order window appears as `12 小时`, not `12 天`.

## Why

The real dhtmlx configuration uses `duration_unit = 'hour'`, and the mapper converts explicit schedule windows into hour-based durations. The tooltip still labeled that duration as days, which could mislead planners reviewing shop-floor schedule windows.

## Verification

- RED: `npx vitest run tests/unit/gantt-chart.test.ts --coverage.enabled=false -t "shows work-order tooltip duration in hours so planners do not read hour-based schedules as days"` failed with `12 天`.
- GREEN: the same targeted test passed after the tooltip label fix.
- `npx vitest run tests/unit/gantt-chart.test.ts --coverage.enabled=false` passed: 28 tests.
- Regression refresh: `npm run test:unit:coverage` passed: 111 files / 1082 tests.
- `npm run lint` passed.
