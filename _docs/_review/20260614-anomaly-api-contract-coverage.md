# Review - Anomaly API contract coverage

## Scope
- Reviewed `src/frontend/src/api/anomaly.ts`.
- Reviewed `src/frontend/tests/unit/anomaly-api.test.ts`.
- Re-ran `AnomalyBoard` unit regression as the primary caller of the helper.

## Findings
- No production-code defect was found in this slice.
- The AnomalyBoard UI fail-loud paths already have multiple verified slices; repeating those branches would have low marginal value.
- The remaining useful gap was direct API helper evidence for anomaly list, critical list, detail, and AI analysis contracts.

## Decision
- Added API contract tests instead of changing implementation.
- Verified backend failures propagate to callers, preserving existing component-level fallback/fail-loud ownership.
- Did not run Chromium because no DOM behavior changed in this slice.

## Residual Risk
- These tests mock the frontend `http` wrapper and do not prove backend schema compatibility by themselves.
- Backend/staging evidence should be used for end-to-end API compatibility when that gate is active.
