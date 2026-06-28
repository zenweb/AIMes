# Changelog - Schedule labor evidence retry recovery - 2026-06-22

## Changed
- Completed `ScheduleBoard` unit-test mocks for labor backend-first evidence reads.
- Added coverage for retrying startup labor evidence after an initial load failure.

## Verified
- `npm run test:unit -- tests/unit/schedule-board.test.ts -t "retry startup labor evidence"`
- `npm run test:unit -- tests/unit/schedule-board.test.ts`
- `npm run test:unit`
