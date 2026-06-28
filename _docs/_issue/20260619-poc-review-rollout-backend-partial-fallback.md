# 2026-06-19 Issue - POC Review/Rollout Backend Partial Fallback

## Symptom
Backend-first POC review and rollout readers could return incomplete latest backend records instead of complete local evidence.

## Root Cause
- Review signoff used `record ?? local` without validating backend record shape.
- Rollout package compared backend/local `createdAt` after only checking truthiness, so a newer partial backend payload could win.

## Impact
- POC review signoff could lose score, reviewers, evidence batches, signer, target customer, and summary.
- POC rollout package could lose go-live gate, owners, success criteria, action evidence, trace ID, and audit summary.
- Audit replay/report surfaces could then show a false latest record with missing release-chain evidence.

## Resolution
- Backend latest review signoff must pass `isPocReviewSignoffRecord`.
- Backend latest rollout package must pass `isPocRolloutPackageRecord` before local/newer comparison.

## Status
Resolved for POC review signoff and rollout package readers. POC pilot run and hypercare readers remain queued for equivalent review.
