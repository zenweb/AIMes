# 2026-06-14 Plan - OTD KPI Commitment Evidence API Contract Evidence

## Success Criteria
- OTD KPI commitment list reads call `/scheduling/otd-kpi-commitments` with the selected `take` param.
- Latest reads call `/scheduling/otd-kpi-commitments/latest`.
- Writes post the original payload to `/scheduling/otd-kpi-commitments`.
- Optional read failures return `[]` or `null` as currently designed.
- Related OTD KPI commitment workflow tests remain green.

## Execution
1. Read `otdKpiCommitmentEvidence.ts` and immediate OTD KPI commitment callers.
2. Add a focused API contract test.
3. Run focused test.
4. Run related OTD KPI commitment regression.
5. Run focused coverage for the new slice.
6. Document changelog, review, todo, issue, and plan entries.

## Outcome
- Criteria met by unit tests and focused coverage.
- No production code change required.
