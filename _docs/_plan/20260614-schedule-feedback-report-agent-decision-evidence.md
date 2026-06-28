# 2026-06-14 Plan - Schedule Feedback Report Agent Decision Evidence

## Goal
- Carry schedule adoption feedback Agent decision evidence through report drilldown and CSV export.

## Success Criteria
- A unit test first fails because report drilldown omits `agentDecisionId`.
- Report OTD evidence-chain records can store an optional decision evidence reference.
- Schedule feedback report evidence shows the Agent decision reference in drilldown and CSV.
- Existing report tests remain green.
- A real Chromium report CSV path proves the user-visible behavior.
- Gray observation is not used as a blocker for this work item.

## Execution
- Add a red unit test for schedule feedback Agent decision evidence in report CSV.
- Add optional `evidenceRef` to OTD evidence-chain records.
- Populate `evidenceRef` from `ScheduleFeedbackSnapshot.agentDecisionId`.
- Update drilldown and CSV output without changing older no-decision-reference wording.
- Run focused and full report verification.

## Result
- Success criteria met for this slice.
- Next work should continue depth-hardening existing core workflows.
