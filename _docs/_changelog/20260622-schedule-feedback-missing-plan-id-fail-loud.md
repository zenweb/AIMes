# Changelog - Schedule feedback missing plan id fail-loud - 2026-06-22

## Changed
- Added a focused `ScheduleBoard` unit test for rush-order feedback when the current schedule plan lacks an ID.
- The test verifies the feedback stays local, backend sync is skipped, and formal schedule writeback is called out as incomplete.

## Verified
- `npm run test:unit -- tests/unit/schedule-board.test.ts -t "rush-order feedback cannot sync"`
- `npm run test:unit -- tests/unit/schedule-board.test.ts`
- `npm run test:unit`
