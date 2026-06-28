# 2026-06-15 ScheduleBoard 人员资质阻断采纳证据

- Added a focused `ScheduleBoard` unit test for labor qualification blocking evidence.
- The test verifies that an active qualification block enters the schedule event queue, generates a stop-work Agent suggestion, and persists supervisor-review evidence into local and backend adoption feedback.
- Hoisted `readLaborQualificationBlock` and `readLaborReassignment` mocks so labor paths can be exercised directly.
- Focused `ScheduleBoard.vue` coverage improved from `80.91/52.86/65.11/81.96` to `82.81/55.29/67.44/83.70`.

Validation:
- `npm run test:unit -- tests/unit/schedule-board.test.ts` => 52 passed.
- `npm run test:unit:coverage -- tests/unit/schedule-board.test.ts --coverage.include=src/components/schedule/ScheduleBoard.vue --coverage.reporter=json-summary --coverage.reporter=text-summary` => statements 82.81%, branches 55.29%, functions 67.44%, lines 83.70%.
- `npm run test:unit:coverage -- --reporter=dot` => 111 files / 951 tests passed.
- Current scoped runtime scan for host `localhost:5000` returned no matches.
