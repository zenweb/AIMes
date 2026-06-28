# 2026-06-14 Todo - Chat Equipment Downtime Action Lock and Evidence

## Next Actions
- Continue hardening existing user-critical paths by coverage leverage and business risk.
- Do not keep drilling the equipment downtime action lock unless a new defect appears.
- Candidate next slices:
  - `AnomalyBoard.vue`: low line coverage and high operational impact for dispatch / startup evidence.
  - `BomBoard.vue`: low statement coverage with material readiness and kitting user paths.
  - `ChatPanel.vue`: only continue if a concrete assistant action gap remains visible in tests or browser evidence.

## Deferred
- Gray observation / 15-day monitoring remains skipped by owner instruction.
