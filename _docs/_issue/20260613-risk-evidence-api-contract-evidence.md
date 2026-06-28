# 2026-06-13 Issue: Risk evidence API helper contract gap

## Status

Closed for this slice.

## Finding

`src/api/riskEvidence.ts` feeds anomaly, monitoring, and risk SLA evidence chains but lacked direct API contract coverage.

## Resolution

Added tests for backend path construction, query params, write payload passthrough, optional read fallbacks, and monitoring fail-loud behavior.

## Remaining risk

This proves frontend request construction and fallback semantics. Runtime incident handling and backend persistence still need separate evidence.

