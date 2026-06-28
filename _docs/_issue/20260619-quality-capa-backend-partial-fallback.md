# 2026-06-19 Issue - Quality CAPA Backend Partial Fallback

## Symptom
`readQualityCapaClosureBackendFirst` returned any non-null backend latest CAPA record without runtime completeness validation.

## Impact
- Report and audit replay flows could show incomplete CAPA closure evidence without owner, root cause, verification, audit state, OTD impact, or review action.

## Root Cause
The backend-first reader trusted the typed API response and did not reuse the complete-record guard already applied to local storage.

## Status
Resolved for the quality CAPA closure backend-first latest-record path.
