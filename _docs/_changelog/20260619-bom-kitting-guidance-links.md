# 2026-06-19 BOM Kitting Guidance Links

## Summary
- Added local guidance for the existing BOM kitting package release flow.
- The BOM-A100 kitting panel now shows Simplified Chinese and English guidance before generating the kitting package.
- Added contextual links to AI scheduling review, inventory kitting, audit replay, and local help.
- This keeps the complex BOM-to-inventory release action connected to version, shortage, alternate material, and OTD evidence checks at the point of action.

## Evidence
- RED: `npm run test:unit -- bom-board.test.ts -t "guides BOM kitting release"` failed because `.kitting-source-guidance` was missing.
- GREEN: the same targeted test passed after adding the guidance and links.
- BomBoard suite: `npm run test:unit -- bom-board.test.ts` passed, 23 tests.
- Full coverage: `npm run test:unit:coverage` passed, 111 files / 1092 tests. Total coverage: statements 89.73%, branches 77.18%, functions 89.90%, lines 92.84%.
- Lint: `npm run lint` passed.
- Build: `npm run build` passed.
- Real browser: production preview on `http://127.0.0.1:4173/scheduling/bom` rendered the BOM-A100 kitting panel with bilingual guidance and related evidence links. Screenshot captured as `bom-kitting-guidance-links-real-browser-20260619`.

## Files
- `src/frontend/src/components/bom/BomBoard.vue`
- `src/frontend/tests/unit/bom-board.test.ts`
