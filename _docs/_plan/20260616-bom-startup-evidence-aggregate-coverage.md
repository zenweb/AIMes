# 2026-06-16 BOM Startup Evidence Aggregate Coverage Plan

## Objective

Harden the BOM engineering-data path by covering startup evidence failures that must not hide each other.

## Success Criteria

- BOM list remains usable when startup evidence restore fails.
- Alternate material evidence failure is visible.
- BOM kitting package evidence failure is visible.
- Targeted BOM tests and coverage pass.
- Related engineering/shortage/OTD regression passes.
- Full frontend coverage passes.

## Outcome

- Success criteria met.
- `BomBoard.vue` targeted lines improved to `88.11%`.
- Full frontend coverage remains green.

## Next Slice

Prefer another user-critical component with coverage leverage, such as `PurchaseBoard.vue` or `ProductionBoard.vue`, rather than chasing low-value BOM fallback lines.
