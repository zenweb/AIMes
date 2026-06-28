# 2026-06-14 Todo - Chat Delivery Recovery Action Lock and Evidence

## Next Actions
- Continue hardening existing user-critical paths by coverage leverage and business risk.
- Do not keep drilling the delivery recovery action lock unless a new defect appears.
- Candidate next slices:
  - `ChatPanel.vue`: engineering constraint or customer commitment actions if evidence shows repeated successful writes remain possible.
  - `AnomalyBoard.vue`: low line coverage and high operational impact for dispatch / startup evidence.
  - `BomBoard.vue`: low statement coverage with material readiness and kitting user paths.

## Deferred
- Gray observation / 15-day monitoring remains skipped by owner instruction.
