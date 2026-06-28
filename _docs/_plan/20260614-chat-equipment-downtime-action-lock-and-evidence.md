# 2026-06-14 Plan - Chat Equipment Downtime Action Lock and Evidence

## Objective
- Harden the existing AI assistant equipment downtime package path so repeated activation cannot create duplicate equipment downtime or OTD evidence records.

## Success Criteria
- RED test proves the action remains enabled after successful package generation before implementation.
- GREEN unit test proves repeated activation writes equipment downtime and OTD evidence once.
- Chromium chat workflow proves the equipment downtime package button is disabled after success.
- Full frontend unit coverage stays green.

## Execution
1. Add RED unit test for duplicate equipment downtime package activation.
2. Add the smallest completed-action lock in the equipment downtime branch.
3. Extend focused Chromium chat workflow with a post-success disabled-button assertion.
4. Run focused unit, full chat unit, focused Chromium e2e, and full frontend unit coverage.
5. Record changelog, review, todo, issue, and plan documents.

## Stop Condition
- Stop this slice after verified duplicate equipment downtime package prevention. Continue with a different existing core workflow next.
