# 2026-06-22 Changelog: Schedule Feedback Submit Close

- Added a ScheduleBoard regression test proving scheduler feedback submission closes the feedback form.
- Verified the focused interaction, the full ScheduleBoard suite, and the full frontend unit suite.
- No production code changed; this is an existing-feature polish and evidence slice.

## Validation
- `npm run test:unit -- tests/unit/schedule-board.test.ts -t "closes the feedback form"`: PASS.
- `npm run test:unit -- tests/unit/schedule-board.test.ts`: PASS, 40 tests.
- `npm run test:unit`: PASS, 118 files / 1234 tests.
