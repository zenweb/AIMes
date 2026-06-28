# Changelog - Schedule assistant recovery risk refresh fail-loud - 2026-06-22

## Changed
- `ScheduleBoard` risk-event refresh now supports an opt-in fail-loud mode.
- Assistant recovery handoff closure uses fail-loud risk refresh so closure-specific failure guidance is actually emitted.
- Updated the focused unit test so the risk dashboard failure is attached to the closure action rather than startup loading.

## Verified
- `npm run test:unit -- tests/unit/schedule-board.test.ts -t "risk events fail to refresh"`
- `npm run test:unit -- tests/unit/schedule-board.test.ts`
- `npm run test:unit`
