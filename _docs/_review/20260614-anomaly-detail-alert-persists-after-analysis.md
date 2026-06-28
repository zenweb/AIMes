# 2026-06-14 Review - Anomaly Detail Alert Persists After Analysis

## Scope
- Reviewed the AnomalyBoard alert lifecycle when anomaly detail loading fails but the user continues with AI analysis.
- Focused on fail-loud continuity, current detail usability, and regression evidence.

## Findings
- Prior behavior used one `notification` string for detail, analysis, operation, and startup alert state.
- `handleAnalyze()` cleared the shared notification before analysis, so a successful AI analysis hid the earlier anomaly detail-load failure.
- The updated behavior separates notification lanes and recomposes the visible alert, so analysis success does not erase detail-load diagnostics.

## Verification
- RED was observed before the fix on the new unit regression.
- Focused unit: 1/1 passed.
- Anomaly unit suite: 12/12 passed.
- Anomaly Chromium suite: 9/9 passed.
- Frontend coverage: 776/776 unit tests passed.

## Residual Risk
- Full coverage still emits the existing Node warning: `--localstorage-file was provided without a valid path`.
- This slice does not change backend anomaly API behavior; it hardens frontend alert state ownership.

