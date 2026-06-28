# 2026-06-15 Changelog: ShortageActionPanel coverage

## Changed

- Added focused unit evidence for `ShortageActionPanel`.
- Covered open shortage display, ordered shortage trace display, mitigated shortage risk display, disabled receipt before expedite order creation, and expedite/alternate/receive event emission.

## Verification

- Baseline before adding the test: focused coverage failed at 0% because `tests/unit/shortage-action-panel.test.ts` did not exist.
- `npm run test:unit -- tests/unit/shortage-action-panel.test.ts` => 1 file passed, 3 tests passed.
- `npm run test:unit:coverage -- tests/unit/shortage-action-panel.test.ts --coverage.include=src/components/purchase/ShortageActionPanel.vue` => statements 100%, branches 100%, functions 100%, lines 100%.
- `npm run test:unit:coverage -- --reporter=dot` => 110 files passed, 851 tests passed; global frontend coverage: statements 82.78%, branches 67.97%, functions 79.73%, lines 86.32%.

## Notes

- No production component logic was changed.
- This closes the last file-name-direct component test gap found under `src/frontend/src/components`.
