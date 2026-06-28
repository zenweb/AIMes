# 2026-06-19 Review - Anomaly Dispatch Backend Partial Fallback

## Scope
- Reviewed anomaly dispatch backend-first read path for partial payload handling.
- Files changed:
  - `src/frontend/src/utils/anomaly-dispatch-sync.ts`
  - `src/frontend/tests/unit/anomaly-dispatch-sync.test.ts`

## Finding
- Backend-first reads merged raw backend records before runtime shape validation. A partial record with the same id could win de-duplication and hide the complete local dispatch record.

## Resolution
- Reused the existing `isRecord` guard for backend records before `mergeAnomalyDispatchRecords`.

## Residual Risk
- `queryAnomalyDispatchRecords` still exposes a typed `AnomalyDispatchRecord[]` API even though runtime data can be malformed. The read boundary now protects this path; future callers should either share the same guard or move validation into the API adapter.
