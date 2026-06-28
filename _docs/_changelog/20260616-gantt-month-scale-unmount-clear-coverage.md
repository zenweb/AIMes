# 2026-06-16 Gantt Month Scale And Unmount Clear Coverage

- Added focused unit evidence for `GanttChart.vue` month-scale review behavior.
- Added focused unit evidence that real dhtmlx data is cleared on unmount so stale schedules cannot remain when planners leave the route.
- Production code was not changed; existing behavior was covered directly.
- Coverage percentage did not move because the exercised implementation lines already had incidental coverage, but the two business assertions were previously not explicit.

## Verification

- Targeted new tests: `npm run test:unit -- tests/unit/gantt-chart.test.ts -t "month scale|clears real dhtmlx data" --reporter=dot`
  - Result: `2 passed | 23 skipped`.
- Targeted Gantt coverage: `npm run test:unit:coverage -- tests/unit/gantt-chart.test.ts --reporter=dot --coverage.reporter=text`
  - Result: `1 file / 25 tests passed`.
  - `GanttChart.vue`: statements `82.07%`, branches `57.66%`, functions `84.31%`, lines `87.21%`.
- Full frontend coverage: `npm run test:unit:coverage -- --reporter=dot`
  - Result: `111 files / 1043 tests passed`.
  - Totals: statements `89.07%`, branches `76.19%`, functions `88.89%`, lines `92.24%`.
