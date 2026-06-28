# Production scanned exception evidence fail-loud coverage

## Changed

- Added regression coverage for scanned production exception reporting when barcode anomaly evidence archival fails after the backend exception API succeeds.
- Confirmed the existing implementation already fails loud through the shared exception evidence error path, so no production code change was needed.

## Validation

- `npm run test:unit -- tests/unit/production-board.test.ts -t "fails loud when scanned exception barcode evidence"`: 1 passed.
- `npm run test:unit -- tests/unit/production-board.test.ts`: 32 passed.
- `npm run test:unit -- tests/unit/production-api.test.ts`: 5 passed.
- `npm run test:unit:coverage -- tests/unit/production-board.test.ts`: 32 passed; `ProductionBoard.vue` lines 84.23%.
