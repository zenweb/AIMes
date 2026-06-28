# Production route scan context coverage

## Changed

- Expanded `src/frontend/tests/unit/production-board.test.ts` with route `scanCode` coverage for the production reporting handoff path.
- Added a controllable `vue-router` route query mock so tests can verify URL-driven scan context without affecting other ProductionBoard cases.
- Locked the expected behavior that opening ProductionBoard with `?scanCode=wo-rush-9001`:
  - normalizes the code to `WO-RUSH-9001`;
  - inserts/selects the barcode work order when the backend list is empty;
  - loads the operation context;
  - renders the barcode reporting panel with trace, operation, equipment, and action;
  - announces the context through the notification region.

## Validation

- `npm run test:unit -- tests/unit/production-board.test.ts`: 1 file / 27 tests passed.
- `npm run test:unit -- tests/unit/production-api.test.ts`: 1 file / 5 tests passed.
- `npm run test:unit:coverage -- tests/unit/production-board.test.ts`: 1 file / 27 tests passed; `ProductionBoard.vue` lines 81.88%.
- `npm run test:unit:coverage`: 107 files / 797 tests passed; lines 84.45%.

## Notes

- No production code change was required; existing route scan-code behavior is now covered.
- This is unit-level route/context evidence. Real browser evidence is still reserved for UI behavior changes.
