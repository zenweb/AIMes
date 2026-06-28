# 2026-06-22 Schedule Startup Engineering Fail-Loud

- Added startup engineering constraint warning aggregation in `ScheduleBoard`.
- Changed startup alternate-material, engineering-change, and route-capability reads to use backend-first `failLoud: true`.
- Added a focused unit test proving a startup engineering evidence failure keeps the schedule plan usable while showing a visible warning.

Verification:
- `npm run test:unit -- tests/unit/schedule-board.test.ts`: PASS, 1 file / 76 tests.
- `git diff --cached --check`: PASS.
