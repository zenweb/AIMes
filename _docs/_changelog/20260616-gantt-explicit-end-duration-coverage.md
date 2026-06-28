# 2026-06-16 Gantt Explicit End Duration Coverage

- Fixed `GanttChart.vue` dhtmlx task conversion so an explicit `end_date` is authoritative for rendered duration.
- Before this slice, a task from `2026-06-02 08:00` to `2026-06-02 20:00` still rendered with `duration: 24` because the mapper always converted internal day duration to hours.
- Added a regression test proving explicit schedule windows render as `duration: 12` while preserving the explicit end date.
- Kept the fallback behavior for tasks without `end_date`: internal day duration is still converted to hours and a dhtmlx end date is derived.

## Verification

- Red test first:
  - `npm run test:unit -- tests/unit/gantt-chart.test.ts -t "derives dhtmlx duration from explicit task end dates so real schedule windows stay authoritative" --reporter=dot`
  - Expected failure observed: received `duration: 24`, expected `duration: 12`.
- Green targeted test:
  - Same command passed: `1 passed | 25 skipped`.
- Targeted coverage:
  - `npm run test:unit:coverage -- tests/unit/gantt-chart.test.ts --reporter=dot --coverage.reporter=text`
  - `26 passed`.
  - `GanttChart.vue`: statements `82.21%`, branches `58.78%`, functions `84.61%`, lines `87.33%`.
- Full frontend coverage:
  - `npm run test:unit:coverage -- --reporter=dot`
  - `111 files / 1053 tests passed`.
  - Totals: statements `89.32%`, branches `76.57%`, functions `89.19%`, lines `92.48%`.
