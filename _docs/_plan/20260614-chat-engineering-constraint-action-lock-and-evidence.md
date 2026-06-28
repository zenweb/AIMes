# 2026-06-14 Plan - Chat Engineering Constraint Action Lock and Evidence

## Objective
- Harden the existing AI assistant engineering constraint path so repeated activation cannot create duplicate engineering constraint package or audit evidence.

## Success Criteria
- RED test proves the action remains enabled after successful package generation before implementation.
- GREEN unit test proves repeated activation writes engineering constraint package and success audit once.
- Chromium chat workflow proves the engineering constraint package button is disabled after success.
- Full frontend unit coverage stays green.

## Execution
1. Add RED unit test for duplicate engineering constraint action activation.
2. Add the smallest completed-action lock in the engineering constraint branch.
3. Extend focused Chromium chat workflow with a post-success disabled-button assertion.
4. Run focused unit, full chat unit, focused Chromium e2e, and full frontend unit coverage.
5. Record changelog, review, todo, issue, and plan documents.

## Stop Condition
- Stop this slice after verified duplicate engineering constraint action prevention. Continue with a different existing core workflow next.
