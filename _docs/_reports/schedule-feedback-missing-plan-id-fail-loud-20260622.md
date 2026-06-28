# Schedule feedback missing plan id fail-loud evidence - 2026-06-22

## Scope
- Covered the Scheduler Pro Workbench feedback path when the current schedule plan lacks an ID.
- This path matters because operator feedback can be stored locally while backend audit sync and formal schedule writeback cannot proceed.

## Change
- Added a focused unit test for accepting a rush-order Agent recommendation when `planData.id` is blank.
- Verified the UI announces:
  - feedback remains in local review history,
  - backend sync did not run,
  - the formal schedule plan was not written.

## Evidence
- `npm run test:unit -- tests/unit/schedule-board.test.ts -t "rush-order feedback cannot sync"` passed, 1 focused test.
- `npm run test:unit -- tests/unit/schedule-board.test.ts` passed, 43 tests.
- `npm run test:unit` passed, 118 files / 1243 tests.

## Result
- PASS. Rush-order feedback without a schedule plan ID does not call `submitAdoptionFeedback`.
- PASS. The operator gets a visible fail-loud note instead of a false backend-sync signal.
