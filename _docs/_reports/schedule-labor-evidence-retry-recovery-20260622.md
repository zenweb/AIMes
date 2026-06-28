# Schedule labor evidence retry recovery evidence - 2026-06-22

## Scope
- Covered the Scheduler Pro Workbench startup labor evidence retry path.
- This path is user-visible through the `重试人员证据 / Retry labor evidence` action in the warning bar.

## Change
- Completed the `ScheduleBoard` unit-test mock for labor backend-first evidence reads:
  - `readLaborQualificationBlocksBackendFirst`
  - `readLaborReassignmentsBackendFirst`
- Added a focused unit test proving operators can retry after startup labor evidence load failure.

## Evidence
- `npm run test:unit -- tests/unit/schedule-board.test.ts -t "retry startup labor evidence"` passed, 1 focused test.
- `npm run test:unit -- tests/unit/schedule-board.test.ts` passed, 45 tests.
- `npm run test:unit` passed, 118 files / 1245 tests.

## Result
- PASS. Startup labor evidence failure shows an operator-visible warning.
- PASS. A successful retry reloads both labor evidence sources and clears the startup warning.
