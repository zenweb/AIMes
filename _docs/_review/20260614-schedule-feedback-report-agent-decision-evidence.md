# 2026-06-14 Review - Schedule Feedback Report Agent Decision Evidence

## Scope
- Reviewed whether schedule feedback evidence remains traceable when it flows from AI scheduling into report drilldown and CSV export.

## Findings
- The report already included the required reason detail and trace ID.
- `ScheduleFeedbackSnapshot` already had `agentDecisionId`, but report drilldown and CSV export did not surface it.
- Without the Agent decision reference, the report could prove a human adoption reason existed but could not directly point back to the Agent decision evidence.

## Resolution
- Added optional `evidenceRef` to OTD evidence-chain records.
- Populated schedule feedback report evidence from `agentDecisionId`.
- Added unit and Chromium evidence proving the decision reference appears in drilldown and CSV export.

## Verification
- Focused red/green unit test passed after implementation.
- Full `report-board.test.ts`: 16/16 passed.
- Focused Chromium report CSV scenario passed after Nuxt production build.

## Residual Risk
- This slice covers local schedule feedback snapshots and report export. Backend latest feedback DTO already carries `AgentDecisionId`; broader backend report export snapshots remain outside this local CSV boundary.
- Gray observation remains intentionally skipped/deferred by owner direction.
