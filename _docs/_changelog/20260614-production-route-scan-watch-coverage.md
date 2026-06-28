# Production route scan watch coverage

## Changed

- Expanded `src/frontend/tests/unit/production-board.test.ts` to cover route `scanCode` changes after ProductionBoard has already loaded.
- Made the route-query test double reactive so Vue's `watch(() => route.query.scanCode)` branch can be exercised directly.
- Locked the behavior that changing `scanCode` to `wo-rush-9001`:
  - preserves already loaded work orders;
  - inserts the barcode work order at the top of the list;
  - selects the new work order;
  - loads the production operation context;
  - renders the barcode reporting panel and success notification.

## Validation

- `npm run test:unit -- tests/unit/production-board.test.ts`: 1 file / 29 tests passed.
- `npm run test:unit -- tests/unit/production-api.test.ts`: 1 file / 5 tests passed.
- `npm run test:unit:coverage -- tests/unit/production-board.test.ts`: 1 file / 29 tests passed; `ProductionBoard.vue` lines 82.6%.
- `npm run test:unit:coverage`: 107 files / 799 tests passed; lines 84.49%.

## Notes

- No production code change was required; this slice adds regression evidence for an existing watcher path.
- This is unit evidence. Real browser evidence is only needed if route/runtime UI behavior changes.
