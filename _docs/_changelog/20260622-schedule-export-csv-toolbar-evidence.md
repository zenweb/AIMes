# Changelog - Schedule export CSV toolbar evidence - 2026-06-22

## Changed
- Added focused `ScheduleBoard` unit coverage for toolbar CSV export.
- Exposed the export mock so tests can verify the component-to-download contract.

## Verified
- `npm run test:unit -- tests/unit/schedule-board.test.ts -t "exports the current schedule plan"`
- `npm run test:unit -- tests/unit/schedule-board.test.ts`
- `npm run test:unit`
