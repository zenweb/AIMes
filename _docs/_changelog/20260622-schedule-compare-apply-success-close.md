# 2026-06-22 Changelog: Schedule Compare Apply Success Close

- Added a ScheduleBoard regression test proving applied batch comparison plans close the comparison panel.
- Verified that applying a compared plan submits audit feedback and runs optimization with the selected objective.
- No production code changed; this is an existing-feature hardening and evidence slice.

## Validation
- `npm run test:unit -- tests/unit/schedule-board.test.ts -t "closes the comparison panel"`: PASS.
- `npm run test:unit -- tests/unit/schedule-board.test.ts`: PASS, 41 tests.
- `npm run test:unit`: PASS, 118 files / 1235 tests.
