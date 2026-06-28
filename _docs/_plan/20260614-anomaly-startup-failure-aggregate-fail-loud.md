# 2026-06-14 Plan - Anomaly Startup Failure Aggregate Fail Loud

## Success Criteria
- Dispatch-record startup failures remain visible when anomaly-list loading also fails.
- Anomaly-list failures remain visible in the same fail-loud alert.
- Demo anomaly records still render after list fallback.
- Event dispatch lanes remain actionable after startup failures.
- Unit, real Chromium e2e, and coverage regressions pass.

## Execution
1. Add a focused unit test for simultaneous startup failures.
2. Verify RED: the dispatch-record failure is overwritten by the anomaly-list fallback.
3. Add a startup notification collection path.
4. Add real Chromium evidence for backend and local-storage dispatch failure plus anomaly-list API failure.
5. Run focused, full anomaly, and coverage regressions.

## Outcome
- Criteria met.
- Gray observation remains skipped/deferred by owner instruction and does not block this slice.
