# Production scanned quality-fail freeze coverage

## Changed

- Added regression coverage for scanned completion when the quality gate fails.
- The test verifies that nonconforming scanned completion writes and exposes rework, handoff freeze, CAPA, isolation, rework cost, and label-hold evidence.
- Confirmed the existing implementation already satisfies the branch; no production code change was required.

## Validation

- `npm run test:unit -- tests/unit/production-board.test.ts -t "freezes scanned completion handoff"`: 1 passed.
- `npm run test:unit -- tests/unit/production-board.test.ts`: 33 passed.
- `npm run test:unit -- tests/unit/production-api.test.ts`: 5 passed.
- `npm run test:unit:coverage -- tests/unit/production-board.test.ts`: 33 passed; `ProductionBoard.vue` lines 89.31%.
