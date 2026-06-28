# 2026-06-22 Changelog: Schedule Rejected Rush Writeback Boundary

- Added a ScheduleBoard unit regression proving rejected rush-order Agent suggestions do not trigger the formal schedule writeback warning.
- Verified the new branch with a focused test, the full ScheduleBoard suite, and the full frontend unit suite.
- No production code changed; this is a targeted existing-feature hardening slice.

## Validation
- `npm run test:unit -- tests/unit/schedule-board.test.ts -t "does not require formal schedule writeback"`: PASS.
- `npm run test:unit -- tests/unit/schedule-board.test.ts`: PASS, 39 tests.
- `npm run test:unit`: PASS, 118 files / 1233 tests.
