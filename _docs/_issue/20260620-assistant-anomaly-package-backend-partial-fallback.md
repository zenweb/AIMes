# 2026-06-20 Issue: Assistant Anomaly Package Backend Partial Fallback

## Issue
`readAssistantAnomalyDispositionPackagesBackendFirst()` trusted backend anomaly package records before verifying response shape or package completeness, and `queryAssistantAnomalyPackages()` could not fail loud.

## Impact
- Backend outages were silently converted to empty arrays even when fail-loud behavior was needed.
- A non-array backend payload could be swallowed in normal fallback or surface as an implementation error at merge time.
- A partial backend record with only identifiers and timestamps could replace a complete local anomaly disposition package.
- That would weaken traceability across production anomaly, risk dispatch, AI scheduling, equipment maintenance, and OTD evidence.

## Resolution
- Added fail-loud support to `queryAssistantAnomalyPackages()`.
- Added explicit non-array backend payload handling.
- Reused `isAssistantAnomalyPackage` to filter backend records before merge.
- Preserved local complete records as fallback when backend records are missing, malformed, or incomplete.

## Evidence
- Targeted and adjacent unit tests passed on 2026-06-20.
