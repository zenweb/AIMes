# 2026-06-16 Schedule Customer Commitment Review Coverage

- Added direct regression coverage for `ScheduleBoard.vue` customer delivery commitment review.
- Made the OTD KPI commitment sync mocks controllable in the schedule board unit suite.
- Added a customer commitment fixture for the East China new-energy customer commitment package.
- Locked the business rule that a published customer delivery recovery promise must still trigger schedule review across:
  - locked-window insertion,
  - shortage closure,
  - CNC bottleneck protection,
  - quality gate retention.
- Production code was not changed.

## Verification

- `npm run test:unit -- tests/unit/schedule-board.test.ts --reporter=dot`
  - `1 file / 64 tests passed`.
- `npm run test:unit:coverage -- tests/unit/schedule-board.test.ts --reporter=dot --coverage.reporter=text`
  - `ScheduleBoard.vue`: statements `88.69%`, branches `68.33%`, functions `77.51%`, lines `89.71%`.
- `npm run test:unit -- tests/unit/schedule-board.test.ts tests/unit/schedule-feedback-panel.test.ts tests/unit/schedule-agent-workbench-panel.test.ts tests/unit/schedule-recovery-handoff-panel.test.ts tests/unit/otd-kpi-commitment-sync.test.ts --reporter=dot`
  - `5 files / 85 tests passed`.
- `npm run test:unit:coverage -- --reporter=dot`
  - `111 files / 1032 tests passed`.
  - overall statements `88.72%`, branches `75.98%`, functions `88.46%`, lines `91.9%`.
