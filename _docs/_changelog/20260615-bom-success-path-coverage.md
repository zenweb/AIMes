# 2026-06-15 Changelog: BOM success path coverage

## Changed

- Added focused unit evidence for `BomBoard` success paths.
- Covered backend BOM explosion rendering and tree collapse.
- Covered successful alternate material approval and scheduling bridge update.
- Covered successful ECN rejection and original material strategy retention.
- Covered BOM pagination loading.

## Verification

- Focused `BomBoard` coverage before this slice: statements 74.46%, branches 61.26%, functions 74%, lines 80.49%.
- First target run failed because the alternate approval test expected trace ID text that the UI does not render; the assertion was corrected to the rendered audit ID contract.
- `npm run test:unit -- tests/unit/bom-board.test.ts` => 1 file passed, 18 tests passed.
- `npm run test:unit:coverage -- tests/unit/bom-board.test.ts --coverage.include=src/components/bom/BomBoard.vue` => statements 82.37%, branches 74.32%, functions 92%, lines 87.13%.

## Notes

- No production component logic was changed.
- This hardens existing BOM/engineering data flows that feed scheduling, inventory kitting, and ECN review.
