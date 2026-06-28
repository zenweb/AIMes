# 2026-06-19 Plan - POC Review/Rollout Backend Partial Fallback

## Goal
Protect POC review and rollout backend-first evidence readers from incomplete backend latest payloads while preserving complete backend readback when the payload is valid.

## Steps
1. Inspect current POC review signoff and rollout package sync readers plus unit tests.
2. Strengthen rollout RED by making the partial backend package newer than local evidence.
3. Confirm RED for both review signoff and rollout package partial backend cases.
4. Add minimal guard checks before accepting backend latest records.
5. Run focused sync/API tests, filtered adjacent panel tests, lint, and diff check.
6. Record evidence and remaining POC reader audit items.

## Stop Condition
- Partial backend review signoff cannot remove score, reviewers, signed-by, evidence batches, summary, or target customer.
- Partial backend rollout package cannot remove go-live gate, owner, success criteria, actions, trace ID, or summary.
- Complete backend rollout package timestamp comparison still works as before.
- Verification results and skipped filtered-test counts are documented.
