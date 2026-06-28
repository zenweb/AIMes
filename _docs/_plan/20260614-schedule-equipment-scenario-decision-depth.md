# 2026-06-14 Plan - Schedule Equipment Scenario Decision Depth

## Success Criteria
- Existing equipment-risk Agent suggestion has direct scenario-depth evidence.
- Focused unit test passes.
- Full frontend coverage remains green.
- A matching real Chromium scheduling workflow remains green.
- Sensitive scan for touched files is clean.

## Scope
- In scope: `src/frontend/tests/unit/schedule-board.test.ts` and required documentation.
- Out of scope: new scheduling behavior, release gray observation, unrelated refactors.

## Result
- Added assertion depth for equipment-risk scenario decisions.
- `ScheduleBoard.vue` line coverage remained 75.57% because the path was already executed.
- Full frontend coverage passed with 673 tests.
- Real Chromium scheduling fallback workflow passed.
