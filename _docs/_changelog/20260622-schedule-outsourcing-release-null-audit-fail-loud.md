# Changelog - Schedule outsourcing release null audit fail-loud - 2026-06-22

## Changed
- Outsourcing schedule release now fails loud when no release audit record is returned.
- Added focused `ScheduleBoard` coverage for the no-audit-record path.

## Verified
- `npm run test:unit -- tests/unit/schedule-board.test.ts -t "returns no audit record"`
- `npm run test:unit -- tests/unit/schedule-board.test.ts`
- `npm run test:unit`
