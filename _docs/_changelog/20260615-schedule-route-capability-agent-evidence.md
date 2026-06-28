# 2026-06-15 ScheduleBoard 工艺能力 Agent 采纳证据

- Added a focused `ScheduleBoard` unit test for route capability blocking evidence.
- The test verifies that a validated heat-treatment capacity gap enters the schedule event queue, generates a blocking Agent suggestion, and persists accepted route-event context into local and backend adoption feedback.
- Focused `ScheduleBoard.vue` coverage improved from `80.17/48.96/64.34/81.32` to `80.91/51.27/65.11/81.96`.

Validation:
- `npm run test:unit -- tests/unit/schedule-board.test.ts` => 50 passed.
- `npm run test:unit:coverage -- tests/unit/schedule-board.test.ts --coverage.include=src/components/schedule/ScheduleBoard.vue --coverage.reporter=json-summary --coverage.reporter=text-summary` => statements 80.91%, branches 51.27%, functions 65.11%, lines 81.96%.
- `npm run test:unit:coverage -- --reporter=dot` => 111 files / 949 tests passed.
- Current scoped runtime scan for host `localhost:5000` returned no matches.

Operational note:
- Live browser staging remains deferred until Docker API is available and host `5002` is free, or a declared non-5000 override is used.
