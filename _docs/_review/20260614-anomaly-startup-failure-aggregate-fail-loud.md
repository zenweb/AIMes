# 2026-06-14 Review - Anomaly Startup Failure Aggregate Fail Loud

## Scope
- Reviewed AnomalyBoard startup behavior when multiple startup data sources fail.
- Focused on fail-loud visibility, anomaly-list continuity, dispatch-lane continuity, and real Chromium behavior.

## Findings
- Prior behavior wrote all startup failures into a single `notification` string, so a later anomaly-list fallback could hide an earlier dispatch-record startup failure.
- The updated behavior collects startup failure messages and renders them together.
- User-triggered dispatch failures still use the existing immediate notification behavior.

## Verification
- Focused RED/GREEN unit evidence proved the dispatch-record startup failure was previously overwritten.
- Full AnomalyBoard unit regression: 9/9 passed.
- Full Anomaly Chromium regression: 9/9 passed.
- Coverage regression: 690/690 frontend unit tests passed.

## Residual Risk
- This slice covers frontend startup observability and browser-visible fallback behavior, not backend availability of anomaly or dispatch APIs.
- Later user actions intentionally replace the startup alert with action-specific feedback.
