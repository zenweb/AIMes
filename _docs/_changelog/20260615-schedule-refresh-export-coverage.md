# 2026-06-15 Changelog: Schedule refresh and export coverage

- Added ScheduleBoard coverage for manual toolbar refresh recovering from an initial backend fallback state.
- Added ScheduleBoard coverage for toolbar CSV export using the currently loaded schedule rows.
- Hoisted the unit-test `useExport` mock so export filename and row payloads are auditable in tests.

Verification:
- `npm run test:unit -- tests/unit/schedule-board.test.ts`: 45 passed.
- `npm run test:unit:coverage -- tests/unit/schedule-board.test.ts --coverage.include=src/components/schedule/ScheduleBoard.vue --coverage.reporter=json-summary --coverage.reporter=json`: passed.
- Focused ScheduleBoard coverage: statements 79.29%, branches 48.84%, functions 62.79%, lines 80.37%.
- `npm run test:unit:coverage -- --reporter=dot`: 111 files passed, 905 tests passed; global lines 88.31%.

Note:
- A concurrent coverage run briefly failed because two Vitest coverage processes wrote the same `coverage/.tmp` directory. The full coverage command was rerun sequentially and passed.
