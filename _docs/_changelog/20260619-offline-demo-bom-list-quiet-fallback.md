# 2026-06-19 Offline Demo BOM List Quiet Fallback

## Summary
- Fixed `/scheduling/bom?offlineDemo=1` so skipped BOM-list backend reads no longer leak technical errors to users.
- Preserved fail-loud behavior for real BOM-list backend failures.

## Changed
- `src/frontend/src/components/bom/BomBoard.vue`
  - Detects `OfflineDemoApiError` when `/api/v1/bom` is skipped in offline demo mode.
  - Keeps local demo BOM records visible without showing the BOM list failure alert.
- `src/frontend/tests/unit/bom-board.test.ts`
  - Added RED/GREEN regression coverage for quiet offline demo BOM-list fallback.
  - Kept ordinary BOM-list failure coverage active.

## Evidence
- RED: `npm run test:unit -- tests/unit/bom-board.test.ts -t "quietly shows local BOM records"` failed before the component change because an alert still existed.
- GREEN: `npm run test:unit -- tests/unit/bom-board.test.ts -t "quietly shows local BOM records"` -> 1 passed.
- Fail-loud guard: `npm run test:unit -- tests/unit/bom-board.test.ts -t "BOM list API is unavailable"` -> 1 passed.
- `npm run test:unit -- tests/unit/bom-board.test.ts` -> 25 passed.
- Offline demo regression bundle -> 377 passed.
- `npm run build` -> passed.
- Real browser:
  - `/scheduling/bom?offlineDemo=1`
  - `hasBackendSkip: false`
  - `hasBomListFailure: false`
  - `alertCount: 0`
  - `optionCount: 3`
  - demo BOM `BOM-A100 / 产品A 物料清单` visible.

## Additional Sweep Findings
- Still queued for later offline demo quiet-fallback slices:
  - `/scheduling/routing`
  - `/scheduling/equipment`
  - `/scheduling/purchase`
  - `/scheduling/barcode`
  - `/scheduling/scanner`
