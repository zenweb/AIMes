# 2026-06-15 Changelog: PurchaseBoard create/export/audit coverage

- Added PurchaseBoard tests for CSV export payload, successful create form submission with material-line editing, Space-key order selection, paginated list refresh, audit replay focus for existing and missing purchase orders, and local expedited-order fallback when backend creation is unavailable.
- No production component code was changed in this slice.

## Coverage

- Before: `PurchaseBoard.vue` statements 75.59%, branches 73.58%, functions 58.75%, lines 79.7%.
- After: `PurchaseBoard.vue` statements 84.61%, branches 83.64%, functions 85%, lines 87.76%.

## Validation

- `npm run test:unit -- tests/unit/purchase-board.test.ts`: 33 passed.
- `npm run test:unit:coverage -- tests/unit/purchase-board.test.ts --coverage.include=src/components/purchase/PurchaseBoard.vue`: 33 passed.
- `npm run test:unit:coverage -- --reporter=dot`: 111 files passed, 881 tests passed; global coverage statements 83.9%, branches 69.32%, functions 81.74%, lines 87.21%.
