# Production invalid route scan guard coverage

## Changed

- Expanded `src/frontend/tests/unit/production-board.test.ts` with invalid route `scanCode` guard coverage.
- Locked the behavior that a non-work-order `scanCode` change:
  - does not call production scan APIs again;
  - does not insert a new work order;
  - does not disturb the currently selected work order;
  - does not render barcode context;
  - does not raise success or error notifications.

## Validation

- `npm run test:unit -- tests/unit/production-board.test.ts`: 1 file / 30 tests passed.
- `npm run test:unit -- tests/unit/production-api.test.ts`: 1 file / 5 tests passed.
- `npm run test:unit:coverage -- tests/unit/production-board.test.ts`: 1 file / 30 tests passed; `ProductionBoard.vue` lines 82.6%.
- `npm run test:unit:coverage`: 107 files / 800 tests passed; lines 84.49%.

## Notes

- No production code change was required; the existing guard behavior is now covered.
- The date is 2026-06-15 local time when this documentation was written.
