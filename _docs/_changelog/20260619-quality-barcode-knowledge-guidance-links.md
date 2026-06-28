# 2026-06-19 Quality Barcode Knowledge Guidance Links

## Summary
- Added local guidance for the existing barcode quality knowledge reuse flow.
- The barcode rework sample panel now shows Simplified Chinese and English guidance before publishing a CAPA knowledge sample.
- Added contextual links to audit replay, report evidence, and the local help anchor.
- This keeps a complex quality operation connected to source evidence, reuse scope, and audit trail at the point of action.

## Evidence
- RED: `npm run test:unit -- quality-board.test.ts -t "guides barcode quality knowledge reuse"` failed because `.barcode-knowledge-guidance` was missing.
- GREEN: the same targeted test passed after adding the guidance and links.
- QualityBoard suite: `npm run test:unit -- quality-board.test.ts` passed, 30 tests.
- Full coverage: `npm run test:unit:coverage` passed, 111 files / 1091 tests. Total coverage: statements 89.73%, branches 77.18%, functions 89.90%, lines 92.84%.
- Lint: `npm run lint` passed.
- Build: `npm run build` passed.
- Real browser: production preview on `http://127.0.0.1:4173/scheduling/quality` rendered the barcode quality knowledge panel with bilingual guidance and related evidence links after local quality-gate evidence was seeded. Screenshots captured as `quality-barcode-knowledge-guidance-links-real-browser-20260619` and `quality-barcode-knowledge-panel-guidance-real-browser-20260619`.

## Files
- `src/frontend/src/components/quality/QualityBoard.vue`
- `src/frontend/tests/unit/quality-board.test.ts`
