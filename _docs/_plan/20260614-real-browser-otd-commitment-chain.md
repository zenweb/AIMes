# 2026-06-14 Plan - Real Browser OTD Commitment Chain

## Success Criteria
- Nuxt production build succeeds for the focused e2e run.
- Customer OTD KPI commitment chain passes in Chromium from Report to Chat and Audit replay.
- Product-family outsourcing commitment chain passes in Chromium from Report to Scheduling, Audit replay, and Report export.
- Evidence documents the gray observation skip/defer boundary without marking it as PASS.

## Execution
1. Reuse existing high-value e2e scenarios instead of adding new scope.
2. Run focused `report.spec.ts` grep for both OTD KPI commitment chains.
3. Record pass/fail facts and boundaries in `_docs/_reports`.
4. Add changelog, review, todo, issue, and plan entries for the completed evidence slice.

## Outcome
- Criteria met by focused Chromium e2e: 2 tests passed.
- No production code change required.
