# 2026-06-14 Plan - Schedule Assistant Engineering Package Startup Fail Loud

## Success Criteria
- Assistant engineering package evidence failure does not prevent primary schedule loading.
- The user sees a fail-loud engineering startup warning with the package failure reason.
- Formal schedule data still renders in a real Chromium browser.
- Existing Scheduling unit and e2e regressions remain green.
- Coverage evidence is refreshed.

## Execution
1. Add a focused unit test that rejects Assistant engineering package loading during startup.
2. Verify RED: `getCurrentPlan` is not called before the fix.
3. Add a safe package read helper that records a startup warning and returns an empty package list.
4. Reuse the helper at startup and after assistant recovery handoff closure.
5. Add real Chromium evidence with backend and local storage failure.
6. Run focused, full Scheduling, and coverage regressions.

## Outcome
- Criteria met for this slice.
- Gray observation remains skipped/deferred by owner instruction and does not block this work.
