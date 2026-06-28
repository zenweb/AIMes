# 2026-06-14 Plan - OTD Evidence API Contract Evidence

## Success Criteria
- OTD evidence reads call `/scheduling/otd-evidence` with the selected `take` param.
- OTD evidence writes post the original payload to the same backend contract path.
- Backend read errors propagate for sync-layer fallback handling.
- Related OTD evidence workflow tests remain green.

## Execution
1. Read `otdEvidence.ts` and immediate OTD sync usage.
2. Add a focused API contract test.
3. Run focused test.
4. Run related OTD evidence regression.
5. Run focused coverage for the new slice.
6. Document changelog, review, todo, issue, and plan entries.

## Outcome
- Criteria met by unit tests and focused coverage.
- No production code change required.
