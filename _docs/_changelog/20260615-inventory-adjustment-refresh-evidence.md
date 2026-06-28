# 2026-06-15 Changelog: inventory adjustment refresh evidence

- Added unit coverage for successful inventory stock adjustment in `InventoryBoard`.
- Verified a completed adjustment closes the dialog, refreshes dashboard/list data, and keeps the adjusted material selected with updated quantity.
- Production code was unchanged; the existing success path already satisfies the behavior.

Validation:

- `npm run test:unit:coverage`: 107 files passed, 820 tests passed, all-files line coverage `85.9%`.
- `npm run test:unit -- tests/unit/inventory-board.test.ts -t "successful stock adjustment"`: 1 passed.
- `npm run test:unit -- tests/unit/inventory-board.test.ts`: 6 passed.
- `npm run test:unit:coverage -- tests/unit/inventory-board.test.ts`: 6 passed; `InventoryBoard.vue` line coverage `85.5%`.
