# 2026-06-14 Plan - Anomaly Dispatch Startup Fail-Loud

## Objective
- Harden the existing anomaly event-center workflow so a dispatch-record startup read failure does not block anomaly list loading.

## Success Criteria
- Add a failing unit test first for startup dispatch-record read failure.
- Prove the test fails because anomaly loading is skipped and the mounted hook rejects.
- Add the minimum production fix in `AnomalyBoard.vue`.
- Verify anomaly list rendering, fail-loud alert, and available event-lane buttons.
- Add real-browser evidence for the same failure mode.
- Run focused and broad verification.

## Execution
- Added one unit regression test in `src/frontend/tests/unit/anomaly-board.test.ts`.
- Confirmed RED: `getAnomalyList` was not called and Vue reported an unhandled mounted-hook rejection.
- Added local try/catch in `applyStoredDispatchRecords()`.
- Added one Chromium scenario in `src/frontend/tests/e2e/anomaly.spec.ts`.
- Ran focused unit, focused coverage, focused Chromium, full anomaly Chromium, and full frontend unit coverage.

## Stop Condition
- Stop this startup dispatch-read subpath for now; it has both unit and real-browser evidence.
- Continue with the next highest-leverage existing feature slice.
- Gray observation / 15-day monitoring remains deferred by owner instruction.
