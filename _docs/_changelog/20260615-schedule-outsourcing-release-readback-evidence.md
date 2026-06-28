# 2026-06-15 Schedule Outsourcing Release Readback Evidence

## Changed

- Added focused unit coverage for the `ScheduleBoard` outsourcing release readback path.
- The test now proves an already archived outsourcing schedule release appears as a released event and generates an OTD review suggestion instead of re-triggering release confirmation.

## Validation

- `npm run test:unit -- tests/unit/schedule-board.test.ts` => 1 file / 56 tests passed.
- `npm run test:unit:coverage -- tests/unit/schedule-board.test.ts --coverage.include=src/components/schedule/ScheduleBoard.vue --coverage.reporter=json-summary --coverage.reporter=text-summary` => `ScheduleBoard.vue` statements/branches/functions/lines `85.02/59.8/71.31/85.75`.
- `npm run test:unit:coverage -- --reporter=dot` => 111 files / 955 tests passed.
- Current runtime/operator scan for host `localhost:5000` returned no matches.

## Notes

- This slice did not add product scope; it hardens an existing external outsourcing release readback path.
- Real browser/staging evidence remains separate and should use `http://localhost:5002` when free, or a declared non-5000 override such as `http://localhost:5003`.
