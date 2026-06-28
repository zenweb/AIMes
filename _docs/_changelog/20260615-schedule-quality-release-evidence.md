# 2026-06-15 ScheduleBoard 质量释放采纳证据

- Added a focused `ScheduleBoard` unit test for barcode quality release evidence.
- The test verifies that quality recheck release restores the OP-20 schedule window, generates a schedule recovery Agent suggestion, and persists the release trace into local and backend adoption feedback.
- Hoisted `readOtdEvidenceChainRecords` so quality release records can be exercised directly.
- Focused `ScheduleBoard.vue` coverage improved from `83.99/56.15/68.99/84.65` to `84.72/57.12/71.31/85.44`.

Validation:
- `npm run test:unit -- tests/unit/schedule-board.test.ts` => 54 passed.
- `npm run test:unit:coverage -- tests/unit/schedule-board.test.ts --coverage.include=src/components/schedule/ScheduleBoard.vue --coverage.reporter=json-summary --coverage.reporter=text-summary` => statements 84.72%, branches 57.12%, functions 71.31%, lines 85.44%.
- `npm run test:unit:coverage -- --reporter=dot` => 111 files / 953 tests passed.
- Current scoped runtime scan for host `localhost:5000` returned no matches.
