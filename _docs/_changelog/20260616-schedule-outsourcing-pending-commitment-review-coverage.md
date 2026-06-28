# 2026-06-16 Schedule Outsourcing Pending Commitment Review Coverage

- Resumed the CC continuation work from `hold_on` after owner goal continuation.
- Added direct regression coverage for `ScheduleBoard.vue` pending outsourcing commitment review.
- Locked the business rule that a vendor commitment without receipt/release evidence must stay outside internal recovery:
  - keep the delayed-order wording as external wait.
  - do not count the vendor wait as an internally recovered order.
  - wait for receipt confirmation before releasing schedule.
- Production code was not changed.

## Verification

- `npm run test:unit -- tests/unit/schedule-board.test.ts --reporter=dot`
  - `1 file / 63 tests passed`.
- `npm run test:unit:coverage -- tests/unit/schedule-board.test.ts --reporter=dot --coverage.reporter=text`
  - `ScheduleBoard.vue`: statements `88.25%`, branches `67.96%`, functions `76.74%`, lines `89.24%`.
- `npm run test:unit -- tests/unit/schedule-board.test.ts tests/unit/schedule-feedback-panel.test.ts tests/unit/schedule-agent-workbench-panel.test.ts tests/unit/schedule-recovery-handoff-panel.test.ts --reporter=dot`
  - `4 files / 78 tests passed`.
- `npm run test:unit:coverage -- --reporter=dot`
  - `111 files / 1031 tests passed`.
  - overall statements `88.69%`, branches `75.96%`, functions `88.43%`, lines `91.87%`.
