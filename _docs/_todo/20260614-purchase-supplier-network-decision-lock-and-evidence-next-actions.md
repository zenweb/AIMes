# 2026-06-14 Todo - Purchase Supplier Network Decision Lock and Evidence

## Next Actions
- Continue hardening existing user-critical paths by coverage leverage and business risk.
- Do not keep drilling the same supplier network SLA decision lock unless a new defect appears.
- Candidate next slices:
  - `ChatPanel.vue`: assistant action paths with low line coverage and high user visibility.
  - `AnomalyBoard.vue`: dispatch / startup evidence paths if a concrete weak edge remains.
  - `PurchaseBoard.vue`: other purchase success-state locks only if evidence shows repeated writes remain possible.

## Deferred
- Gray observation / 15-day monitoring remains skipped by owner instruction.
