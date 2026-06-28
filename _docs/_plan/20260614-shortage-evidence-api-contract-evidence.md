# 2026-06-14 Plan - Shortage Evidence API Contract Evidence

## Success Criteria
- Shortage evidence API latest-read helpers call the expected scheduling endpoints.
- Shortage evidence API write helpers post the original payload to the expected endpoints.
- Optional latest-read helpers return `null` on backend failure.
- Related shortage workflow unit tests remain green.

## Execution
1. Refresh coverage and select a low-coverage, user-critical helper.
2. Read `shortageEvidence.ts` and immediate callers.
3. Add a focused API contract test.
4. Run focused test and related shortage-chain regression.
5. Run focused coverage for the new slice.
6. Document changelog, review, todo, issue, and plan entries.

## Outcome
- Criteria met by unit tests and focused coverage.
- No production code change required.
