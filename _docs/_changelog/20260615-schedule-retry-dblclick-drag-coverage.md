# 2026-06-15 ScheduleBoard retry / double-click / drag coverage

## Changed
- Added ScheduleBoard unit coverage for the error-banner retry button clearing stale optimization alerts after data reload.
- Added Gantt task double-click coverage to prove it opens the same auditable order explanation path as task click.
- Added drag writeback fail-loud coverage for an unknown task id so the user sees `未找到可写回的排产任务` and no backend write is attempted.

## Validation
- `npm run test:unit -- tests/unit/schedule-board.test.ts` -> 48 passed.
- `npm run test:unit:coverage -- tests/unit/schedule-board.test.ts --coverage.include=src/components/schedule/ScheduleBoard.vue --coverage.reporter=json-summary --coverage.reporter=text-summary` -> ScheduleBoard statements 80.17%, branches 48.96%, functions 64.34%, lines 81.32%.
- `npm run test:unit:coverage -- --reporter=dot` -> 111 files, 931 tests passed; all-files statements 86.11%, branches 71.64%, functions 85.14%, lines 89.42%.

## Notes
- A first full coverage attempt was run in parallel with a focused coverage run and failed because Vitest coverage processes shared `coverage/.tmp`; rerunning full coverage alone passed.
- No production component code was changed in this slice.
