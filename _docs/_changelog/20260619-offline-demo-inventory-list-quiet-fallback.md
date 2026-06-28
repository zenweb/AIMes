# 2026-06-19 Offline Demo Inventory List Quiet Fallback

## Summary
- Fixed `/scheduling/inventory?offlineDemo=1` so skipped inventory-list backend reads no longer leak technical errors to users.
- Preserved fail-loud behavior for real inventory-list backend failures.

## Changed
- `src/frontend/src/components/inventory/InventoryBoard.vue`
  - Detects `OfflineDemoApiError` when `/api/v1/inventory` is skipped in offline demo mode.
  - Keeps local demo inventory visible without showing the inventory load failure alert.
- `src/frontend/tests/unit/inventory-board.test.ts`
  - Added RED/GREEN regression coverage for quiet offline demo inventory-list fallback.
  - Kept ordinary inventory-list failure coverage active.

## Evidence
- RED: `npm run test:unit -- tests/unit/inventory-board.test.ts -t "quietly shows demo inventory"` failed before the component change because an alert still existed.
- GREEN: `npm run test:unit -- tests/unit/inventory-board.test.ts -t "quietly shows demo inventory"` -> 1 passed.
- Fail-loud guard: `npm run test:unit -- tests/unit/inventory-board.test.ts -t "inventory list load falls back"` -> 1 passed.
- `npm run test:unit -- tests/unit/inventory-board.test.ts` -> 11 passed.
- Offline demo regression bundle -> 337 passed.
- `npm run build` -> passed.
- Real browser:
  - `/scheduling/inventory?offlineDemo=1`
  - `hasBackendSkip: false`
  - `hasInventoryLoadFailure: false`
  - `alerts: []`
  - `optionCount: 8`
  - demo inventory `MAT-A01 / 轴承钢圈` visible.

## Additional Sweep Findings
- Still queued for later offline demo quiet-fallback slices:
  - `/scheduling/monitoring`
  - `/scheduling/bom`
  - `/scheduling/routing`
  - `/scheduling/equipment`
  - `/scheduling/purchase`
  - `/scheduling/barcode`
  - `/scheduling/scanner`
