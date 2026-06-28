# 2026-06-16 Gantt Init Fail Loud

- Fixed `GanttChart.vue` real dhtmlx initialization so `gantt.init` failures no longer crash the schedule view during mount.
- Added a visible `role="alert"` message that explains the initialization failure and tells planners to keep current filters before retrying.
- Prevented schedule data parsing after a failed real Gantt initialization, avoiding a misleading parse attempt against an unavailable timeline.
- Kept lightweight/offline demo Gantt behavior unchanged.

## Verification

- Red test first:
  - `npm run test:unit -- tests/unit/gantt-chart.test.ts -t "alerts when real gantt initialization fails before parsing schedule data" --reporter=dot`
  - Expected failure observed: `gantt init unavailable` escaped from the mounted hook.
- Green targeted test:
  - Same command passed: `1 passed | 26 skipped`.
- Targeted coverage:
  - `npm run test:unit:coverage -- tests/unit/gantt-chart.test.ts --reporter=dot --coverage.reporter=text`
  - `27 passed`.
  - `GanttChart.vue`: statements `82.23%`, branches `58.57%`, functions `84.61%`, lines `87.55%`.
- Full frontend coverage:
  - `npm run test:unit:coverage -- --reporter=dot --coverage.reporter=text`
  - `111 files / 1058 tests passed`.
  - Totals: statements `89.51%`, branches `77.01%`, functions `89.54%`, lines `92.64%`.
