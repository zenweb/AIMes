# 2026-06-15 Review: purchase material correction evidence

## Result
- Pass. The added test covers the positive path that was missing beside the existing failure guard.

## Evidence
- A material anomaly dispatch with trace `TRACE-ANOM-MATERIAL-20260521-001` triggers `.material-corrective`.
- `writeSupplyRiskEscalation` receives the corrective supplier commitment with status `整改已锁定`.
- `upsertOtdEvidenceChainRecord` records the `采购整改` stage for `WO-RUSH-9001 / WO-DEMO-1002`.
- The purchase board shows `来料异常整改承诺已锁定` and no alert.

## Residual Risk
- This is component-level evidence, not a real browser run.
- `PurchaseBoard.vue` remains below the strongest covered boards; next leverage should still favor remaining user-critical uncovered lines over micro-polishing already proven paths.
