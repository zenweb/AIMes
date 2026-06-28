# Review: BOM kitting OTD sync fail-loud lock

## Scope

- `src/frontend/src/components/bom/BomBoard.vue`
- `src/frontend/tests/unit/bom-board.test.ts`

## Findings

- No blocking finding.
- The change does not hide evidence-chain failure: it still surfaces an alert with the OTD sync error.
- The change avoids duplicate operator submission by treating the BOM kitting package write as the source of truth for locking the release action.

## Evidence

- Target test reproduces the prior gap: OTD evidence sync throws after the BOM package write.
- Fixed behavior keeps `.bom-kitting-source` in `published` state and shows the disabled “BOM 齐套检查包已发布” button.
- Full frontend coverage remains green.
