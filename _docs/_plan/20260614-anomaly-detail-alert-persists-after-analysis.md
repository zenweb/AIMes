# 2026-06-14 Plan - Anomaly Detail Alert Persists After Analysis

## Success Criteria
- Anomaly detail-load failures remain visible after a later AI analysis succeeds.
- Existing anomaly list, dispatch, detail, and AI analysis flows continue to pass unit and real browser verification.
- The slice is documented in changelog, review, todo, issue, and plan.

## Execution
- Add a focused unit regression for detail fallback followed by successful AI analysis.
- Verify RED against the prior shared-notification behavior.
- Split notification ownership into lanes and recompute the user-visible alert.
- Run focused, component, browser, and coverage verification.

## Validation
- RED observed before fix.
- GREEN focused unit, AnomalyBoard unit suite, Anomaly Chromium suite, and frontend coverage.

## Stop Condition
- Stop after alert continuity is verified and documented.
- Do not expand into unrelated anomaly dispatch, backend API, or gray observation work.

