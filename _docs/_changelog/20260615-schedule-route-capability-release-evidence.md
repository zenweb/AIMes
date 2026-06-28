# 2026-06-15 ScheduleBoard 工艺能力放行采纳证据

- Added a focused `ScheduleBoard` unit test for released route capability evidence.
- The test verifies that confirmed heat-treatment split/batch capacity enters the event queue, generates a released-state Agent suggestion, and persists the batch-window trace into local and backend adoption feedback.
- Stabilized `pareto-compare.test.ts` by module-mocking `GanttChart.vue`, preventing late async CSS imports after Vitest environment teardown during full coverage runs.
- Focused `ScheduleBoard.vue` coverage moved from `80.91/51.27/65.11/81.96` to `80.91/52.86/65.11/81.96`.

Validation:
- `npm run test:unit -- tests/unit/schedule-board.test.ts` => 51 passed.
- `npm run test:unit:coverage -- tests/unit/schedule-board.test.ts --coverage.include=src/components/schedule/ScheduleBoard.vue --coverage.reporter=json-summary --coverage.reporter=text-summary` => statements 80.91%, branches 52.86%, functions 65.11%, lines 81.96%.
- `npm run test:unit -- tests/unit/pareto-compare.test.ts` => 39 passed.
- `npm run test:unit:coverage -- tests/unit/pareto-compare.test.ts --coverage.include=src/components/schedule/ParetoCompare.vue --coverage.reporter=text-summary` => passed.
- `npm run test:unit:coverage -- --reporter=dot` => 111 files / 950 tests passed.
- Current scoped runtime scan for host `localhost:5000` returned no matches.
