# 2026-06-14 Plan - Production Completion Lock and Evidence

## Objective
- Harden the existing production completion path so repeated confirmation cannot create duplicate backend completion calls or duplicate evidence.

## Success Criteria
- RED test proves the duplicate completion call exists before implementation.
- GREEN unit test proves repeated confirmation writes completion evidence once.
- Existing completion API failure test proves retry behavior remains available.
- Chromium completion workflow proves completed operations no longer expose the `完工` action.
- Full frontend unit coverage stays green.

## Execution
1. Add RED unit test for duplicate completion confirmation.
2. Add the smallest production guard around completion submission and completed state.
3. Extend focused Chromium completion workflow with a completed-operation action lock assertion.
4. Run focused unit, full production unit, focused Chromium e2e, and full frontend unit coverage.
5. Record changelog, review, todo, issue, and plan documents.

## Stop Condition
- Stop this slice after verified duplicate completion prevention. Continue with a different existing core workflow next.
