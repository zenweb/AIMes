# Production completed barcode read-only guard

## Changed

- Added an operator-visible read-only state for scanned production contexts whose matched operation is already completed.
- The completed barcode context now states that the operation cannot be started or completed again, while preserving the existing rule that no action buttons are rendered for completed operations.
- Added unit coverage to ensure completed barcode operations do not call start, completion, or exception APIs.

## Validation

- `npm run test:unit -- tests/unit/production-board.test.ts -t "shows completed barcode operations as read-only"`: 1 passed.
- `npm run test:unit -- tests/unit/production-board.test.ts`: 31 passed.
- `npm run test:unit:coverage -- tests/unit/production-board.test.ts`: 31 passed; `ProductionBoard.vue` lines 82.6%.
