# 2026-06-19 Issue - Anomaly Dispatch Backend Partial Fallback

## Symptom
An incomplete backend anomaly dispatch record could enter the backend-first merge and suppress a complete local record with the same id.

## Impact
- UI and downstream evidence could lose owner, affected order, delivery impact, schedule window, and suggested action fields.
- This weakens the audit trail for the anomaly dispatch decision.

## Root Cause
`readAnomalyDispatchRecordsBackendFirst` trusted the typed API result and did not apply the runtime `isRecord` guard that already protects local storage reads.

## Status
Resolved for the anomaly dispatch backend-first read path.
