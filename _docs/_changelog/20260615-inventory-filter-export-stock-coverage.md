# 2026-06-15 Changelog: Inventory filter export and stock operation coverage

- Added InventoryBoard coverage for search and material-type filtering, including the empty state when no material matches.
- Added CSV export coverage proving the auditable stock fields are sent to the exporter.
- Added successful stock-in and transfer-operation coverage, including dashboard/list refresh after each operation.
- Added dashboard failure fallback coverage proving demo KPI counts are calculated and the list failure is surfaced.
- Kept this as a test-only hardening slice; no production behavior was changed.

Verification:
- `npm run test:unit -- tests/unit/inventory-board.test.ts`: 10 passed.
- `npm run test:unit:coverage -- tests/unit/inventory-board.test.ts --coverage.include=src/components/inventory/InventoryBoard.vue --coverage.reporter=json-summary --coverage.reporter=text-summary`: passed.
- Focused InventoryBoard coverage: statements 95.56%, branches 85.18%, functions 97.29%, lines 98.55%.
- `npm run test:unit:coverage -- --reporter=dot`: 111 files passed, 928 tests passed; global lines 89.36%.
- Local backend/API evidence remains on `http://localhost:5002`; this slice did not reintroduce host port `5000`.
