# 2026-06-14 Todo - Chat Startup Context Aggregate Fail-Loud

## Next Actions
- Continue routing by coverage increment and user-criticality.
- Do not keep polishing this exact startup context aggregation path; unit and Chromium evidence now cover it.
- Candidate next slices:
  - `ScheduleBoard.vue`: around 75.57% lines, but current worktree already contains substantial scheduling changes, so inspect carefully before touching.
  - `KnowledgeGovernancePanel.vue`: around 76.47% lines, governance evidence workflow.
  - `ReportBoard.vue`: around 76.52% lines, OTD/reporting evidence workflow.
  - `BomBoard.vue`: around 78.53% lines but user-critical for engineering/material readiness if a distinct gap is found.

## Deferred
- Gray observation / 15-day monitoring is skipped/deferred by owner instruction and should not block the next feature-quality slice.
