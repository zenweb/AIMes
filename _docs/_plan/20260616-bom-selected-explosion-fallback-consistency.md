# 2026-06-16 BOM Selected Explosion Fallback Consistency Plan

## Goal

Keep BOM detail and local explosion fallback consistent for the selected BOM so engineering-data review does not show A100 materials while the operator is reviewing B200.

## Success Criteria

- Selecting B200 with a detail API fallback shows B200 local items.
- Triggering explosion with an explosion API fallback shows the same selected B200 material tree.
- Existing A100 fallback behavior remains green.
- Targeted and full frontend coverage pass.

## Result

- Success criteria are met.
- The production change is limited to local fallback conversion inside `BomBoard.vue`.
- Tests now protect the selected-BOM fallback consistency path.

## Next Routing

Pick the next slice by coverage leverage plus user-critical value. Avoid residual BOM line chasing unless a concrete engineering-data behavior gap is identified.
