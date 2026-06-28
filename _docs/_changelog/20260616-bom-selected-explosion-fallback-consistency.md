# 2026-06-16 BOM Selected Explosion Fallback Consistency

- Fixed `BomBoard.vue` local BOM explosion fallback so it derives the tree from the selected BOM's items instead of always returning the A100 demo tree.
- Added recursive `demoExplosionItems` conversion from `BomItem` to `BomExplosionItem`.
- Preserved the existing A100 empty-detail fallback by using `demoItems(bom.id)` when a backend detail payload has no local items.
- Added regression coverage for B200 when both detail and explosion APIs fall back locally.
- Updated `.omx/state/task-hold-on.json` with the latest active slice and verification evidence.

## Verification

- Red first: `npm run test:unit -- tests/unit/bom-board.test.ts -t "selected BOM material tree" --reporter=dot` failed because B200 explosion fallback showed `MAT-A01`.
- Green after fix: same command passed with `1 passed`.
- `npm run test:unit -- tests/unit/bom-board.test.ts -t "falling back to a local explosion tree" --reporter=dot`: `1 passed`.
- `npm run test:unit -- tests/unit/bom-board.test.ts --reporter=dot`: `21 passed`.
- `npm run test:unit:coverage -- tests/unit/bom-board.test.ts --reporter=dot --coverage.reporter=text`: `21 passed`; `BomBoard.vue` statements `84.5%`, branches `76.54%`, functions `92.3%`, lines `88.61%`.
- `npm run test:unit:coverage -- --reporter=dot`: `111 files / 1052 tests passed`; statements `89.31%`, branches `76.56%`, functions `89.18%`, lines `92.48%`.
