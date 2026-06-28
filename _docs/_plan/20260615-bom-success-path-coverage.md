# 2026-06-15 Plan: BOM success path coverage

## Goal

Harden existing BOM engineering data workflows that feed scheduling, material kitting, and ECN decision evidence.

## Success Criteria

- Backend BOM explosion result renders and can collapse child materials.
- Alternate material approval locks the approval UI and updates scheduling bridge copy.
- ECN rejection locks the decision and keeps scheduling on the original material strategy.
- Pagination loads the requested BOM page.
- Focused coverage improves materially without production changes.

## Result

- Added four focused tests to `src/frontend/tests/unit/bom-board.test.ts`.
- `npm run test:unit -- tests/unit/bom-board.test.ts` passed.
- `npm run test:unit:coverage -- tests/unit/bom-board.test.ts --coverage.include=src/components/bom/BomBoard.vue` reported statements 82.37%, branches 74.32%, functions 92%, lines 87.13%.

## Next Route

Continue selecting low-coverage, user-critical existing paths from the full coverage table. Live BOM/browser evidence remains deferred until the AIMes runtime is available on host `5002`.
