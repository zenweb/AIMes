# 2026-06-14 Todo - Production Barcode Completion Handoff Evidence

## Next Actions
- Continue routing by coverage increment and user-criticality.
- Do not keep polishing the same barcode completion path unless a real defect appears; `ProductionBoard.vue` focused line coverage moved to 78.82%.
- Candidate next slices from the latest full coverage:
  - `ChatPanel.vue`: 69.25% lines, broad user-facing assistant workflow.
  - `PurchaseBoard.vue`: 75.15% lines, purchasing execution workflow.
  - `ScheduleBoard.vue`: 75.57% lines, planning and drag/writeback workflow.
  - `notifications.ts`: 75.60% lines, shared notification lifecycle utility.

## Deferred
- Gray observation / 15-day monitoring is skipped/deferred by owner instruction.
