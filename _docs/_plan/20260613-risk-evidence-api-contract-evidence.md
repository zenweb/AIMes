# 2026-06-13 Plan: Risk evidence API contract evidence

## Success criteria

- Select an audit-critical helper connected to risk and shop-floor escalation evidence.
- Verify endpoint paths, query params, write payloads, fallback semantics, and fail-loud behavior.
- Run related sync-layer regressions.

## Result

- Selected `src/api/riskEvidence.ts` because it supports anomaly, monitoring, risk SLA, and risk action chains.
- Added focused API contract tests.
- Verified related anomaly dispatch, monitoring escalation, risk action, risk SLA, and production anomaly sync regressions.

