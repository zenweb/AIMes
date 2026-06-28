# 2026-06-14 Plan - Assistant Evidence API Contract Evidence

## Success Criteria
- Assistant evidence API read helpers call the expected scheduling endpoints with `take` params.
- Assistant evidence API write helpers post the original payload to the expected endpoints.
- Optional assistant reads degrade to empty arrays.
- Audit replay can fail loud when backend evidence is unavailable.
- Related assistant workflow unit tests remain green.

## Execution
1. Read `assistantEvidence.ts` and immediate assistant evidence callers.
2. Add a focused API contract test.
3. Run focused test.
4. Run related assistant-chain regression.
5. Document changelog, review, todo, issue, and plan entries.

## Outcome
- Criteria met by unit tests.
- No production code change required.
