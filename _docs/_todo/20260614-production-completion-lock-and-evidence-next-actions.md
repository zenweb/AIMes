# 2026-06-14 Todo - Production Completion Lock and Evidence

## Next Actions
- Continue hardening existing user-critical paths by coverage leverage and business risk.
- Do not keep drilling the same production completion lock unless a new defect appears.
- Candidate next slices:
  - `PurchaseBoard.vue`: supplier / shortage recovery success-state locks or recovery evidence.
  - `ChatPanel.vue`: assistant action paths with low line coverage and high user visibility.
  - `AnomalyBoard.vue`: dispatch / startup evidence paths if a concrete weak edge remains.

## Deferred
- Gray observation / 15-day monitoring remains skipped by owner instruction.
