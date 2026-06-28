# 2026-06-14 Plan - Purchase Supplier Network Decision Lock and Evidence

## Objective
- Harden the existing purchase supplier network SLA path so repeated selection cannot create duplicate supplier decision or OTD evidence records.

## Success Criteria
- RED test proves the action remains available after successful supplier selection before implementation.
- GREEN unit test proves repeated selection writes supplier decision evidence once.
- Existing pending-state test proves unresolved supplier network decisions still remain actionable.
- Chromium purchase workflow proves the SLA decision button is disabled after selection.
- Full frontend unit coverage stays green.

## Execution
1. Add RED unit test for duplicate supplier network SLA decision.
2. Add the smallest purchase guard around existing decision state.
3. Extend focused Chromium purchase workflow with a post-selection disabled-button assertion.
4. Run focused unit, full purchase unit, focused Chromium e2e, and full frontend unit coverage.
5. Record changelog, review, todo, issue, and plan documents.

## Stop Condition
- Stop this slice after verified duplicate supplier network decision prevention. Continue with a different existing core workflow next.
