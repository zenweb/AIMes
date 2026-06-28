# 2026-06-15 ScheduleBoard 缺料 Agent 采纳证据

- Added a focused `ScheduleBoard` unit test for dynamic backend material shortage events.
- The test verifies that a generated material-shortage Agent suggestion preserves BOM alternate-material reasoning and writes the accepted decision into both local feedback snapshot and backend adoption feedback.
- This is an intent/evidence hardening slice; focused `ScheduleBoard.vue` coverage stayed at statements 80.17%, branches 48.96%, functions 64.34%, lines 81.32%.

Validation:
- `npm run test:unit -- tests/unit/schedule-board.test.ts` => 49 passed.
- `npm run test:unit:coverage -- tests/unit/schedule-board.test.ts --coverage.include=src/components/schedule/ScheduleBoard.vue --coverage.reporter=json-summary --coverage.reporter=text-summary` => focused coverage unchanged.
- `npm run test:unit:coverage -- --reporter=dot` => 111 files / 948 tests passed.
- Current scoped runtime scan for host `localhost:5000` returned no matches.

Operational note:
- Live browser staging remains deferred: Docker API did not return Server OK in this shell, and host `5002` is currently occupied by an unrelated `learun.webapi.exe` process.
