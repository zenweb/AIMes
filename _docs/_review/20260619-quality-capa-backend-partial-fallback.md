# 2026-06-19 Review - Quality CAPA Backend Partial Fallback

## Scope
- Reviewed the quality CAPA closure backend-first latest-record reader.
- Files changed:
  - `src/frontend/src/utils/quality-capa-sync.ts`
  - `src/frontend/tests/unit/quality-capa-sync.test.ts`

## Finding
- Local CAPA reads already rejected incomplete closure JSON, but backend-first reads returned any non-null backend latest record.
- A partial backend CAPA closure could drop owner, root cause, verification, audit state, OTD impact, and review action fields from report and audit replay flows.

## Resolution
- Reused the existing `isQualityCapaClosure` guard on the backend result.
- Complete backend CAPA records still win; null or partial backend records fall back to local complete evidence.

## Residual Risk
- Direct consumers of `getLatestQualityCapaClosure` still receive a typed value without runtime validation. UI and evidence flows should use the guarded sync reader.
