# 2026-06-15 ScheduleBoard 人员替班采纳证据

- Added a focused `ScheduleBoard` unit test for labor reassignment release evidence.
- The test verifies that an approved replacement assignment enters the schedule event queue, generates a startup-review Agent suggestion, and persists reassignment audit evidence into local and backend adoption feedback.
- Focused `ScheduleBoard.vue` coverage improved from `82.81/55.29/67.44/83.70` to `83.99/56.15/68.99/84.65`.

Validation:
- `npm run test:unit -- tests/unit/schedule-board.test.ts` => 53 passed.
- `npm run test:unit:coverage -- tests/unit/schedule-board.test.ts --coverage.include=src/components/schedule/ScheduleBoard.vue --coverage.reporter=json-summary --coverage.reporter=text-summary` => statements 83.99%, branches 56.15%, functions 68.99%, lines 84.65%.
- `npm run test:unit:coverage -- --reporter=dot` => 111 files / 952 tests passed.
- Current scoped runtime scan for host `localhost:5000` returned no matches.
