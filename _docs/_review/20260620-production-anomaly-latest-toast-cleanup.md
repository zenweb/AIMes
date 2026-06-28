# 2026-06-20 Review - Production Anomaly Latest Toast Cleanup

## Scope

- File touched:
  - `src/frontend/src/api/riskEvidence.ts`
  - `src/frontend/tests/unit/risk-evidence-api.test.ts`
  - `src/frontend/tests/unit/production-anomaly-sync.test.ts`

## Review Result

- Result: PASS for this slice.
- Root cause: `/scheduling/production-anomaly-event/latest` is an optional latest evidence read, but it did not suppress the global HTTP error toast. A missing latest record produced a user-visible `请求错误` toast on `/risk` and `/anomaly`.
- Fix: Added the same `suppressErrorToast: true` request config already used by other optional latest evidence reads.
- Behavior preserved: `getLatestProductionAnomalyEvent({ failLoud: true })` still rejects, so audit paths can fail loud when they explicitly request that mode.

## Residual Risk

- Backend still returns 404 when there is no latest production anomaly event. This is acceptable for the current UI path because the missing latest record is an empty optional state, not a failed page load.
- Several other optional latest endpoints still return background 404s in real browser scans, but they do not currently surface as global request toasts.

