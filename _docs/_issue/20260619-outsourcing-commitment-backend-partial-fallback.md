# 2026-06-19 Issue - Outsourcing Commitment Backend Partial Fallback

## Symptom
Outsourcing commitment backend-first reads could return incomplete backend records instead of complete local partner promise and release evidence.

## Root Cause
- List reader accepted any non-empty backend array.
- Latest reader used a truthy backend latest record without validating shape.

## Impact
- Schedule and report views could lose partner name, promise date, affected orders, release actions, audit ID, trace ID, source KPI trace, and summary.
- A partial backend latest record could make an outsourcing commitment look present while hiding the actual release evidence.

## Resolution
- Backend list results are filtered through `isCommitmentPackage`.
- Backend latest result must pass `isCommitmentPackage`; otherwise the local latest complete package is used.

## Status
Resolved for outsourcing commitment list and latest backend-first readers.
