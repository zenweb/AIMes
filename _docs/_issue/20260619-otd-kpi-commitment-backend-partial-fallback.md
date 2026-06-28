# 2026-06-19 Issue - OTD KPI Commitment Backend Partial Fallback

## Symptom
OTD KPI commitment backend-first reads could return incomplete backend records instead of complete local customer commitment packages.

## Root Cause
- List reader accepted any non-empty backend array.
- Latest reader used `record ?? local` without validating backend record shape.

## Impact
- Report and schedule views could lose OTD baseline, Agent OTD, lift, delayed order reduction, commitment text, owner actions, audit ID, trace ID, and customer-facing summary.
- A partial backend latest record could make the customer commitment look present while hiding the actual promise evidence.

## Resolution
- Backend list results are filtered through `isCommitmentPackage`.
- Backend latest result must pass `isCommitmentPackage`; otherwise the local latest complete package is used.

## Status
Resolved for OTD KPI commitment list and latest backend-first readers.
