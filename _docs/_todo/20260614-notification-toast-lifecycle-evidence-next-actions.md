# 2026-06-14 Todo - Notification Toast Lifecycle Evidence

## Next Actions
- Continue routing by coverage increment and user-criticality.
- Do not keep polishing `notifications.ts` immediately unless a real defect appears; line coverage moved from 75.60% to 84.14%.
- Candidate next slices:
  - `ChatPanel.vue`: 70.60% lines, user-facing assistant workflow.
  - `DashboardBoard.vue`: 76.07% lines, user-visible operating cockpit.
  - `ReportBoard.vue`: 76.52% lines, OTD/reporting evidence workflow.
  - `ScheduleBoard.vue`: only for unexecuted branches or real scheduling defects.

## Deferred
- Gray observation / 15-day monitoring is skipped/deferred by owner instruction.
