# 2026-06-15 Changelog: Schedule risk SLA event evidence

## Changed
- Added controllable `ScheduleBoard` unit-test mocks for risk SLA review records.
- Added focused coverage proving a backend risk SLA review package enters the schedule event queue and generates the correct agent suggestion.
- No production code changed; the existing implementation already merged the risk SLA evidence correctly.

## Verification
- `npm run test:unit:coverage`: 107 passed, 814 passed; frontend line coverage `85.73%`.
- `npm run test:unit -- tests/unit/schedule-board.test.ts -t "surfaces closed risk SLA review evidence"`: 1 passed.
- `npm run test:unit -- tests/unit/schedule-board.test.ts`: 42 passed.
- `npm run test:unit:coverage -- tests/unit/schedule-board.test.ts`: 42 passed; `ScheduleBoard.vue` lines `79.58%`, branches `47.62%`.
