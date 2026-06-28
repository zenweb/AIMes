# 2026-06-19 Offline Demo Routing Quiet Fallback

## Summary
- Fixed `/scheduling/routing?offlineDemo=1` so skipped route-list and route-capability history reads no longer leak technical backend skip errors.
- Preserved fail-loud behavior for real routing and route-capability backend failures.

## Changed
- `src/frontend/src/components/routing/RoutingBoard.vue`
  - Detects `OfflineDemoApiError` when `/api/v1/routing` is skipped in offline demo mode.
  - Detects `OfflineDemoApiError` when `/api/v1/scheduling/route-capability-validation/latest` is skipped during capability history loading.
  - Keeps demo routes visible and capability validation open without rendering failure alerts for offline demo skips.
- `src/frontend/tests/unit/routing-board.test.ts`
  - Added RED/GREEN regression coverage for quiet offline demo route-list fallback.
  - Added RED/GREEN regression coverage for quiet offline demo capability-history fallback.
  - Kept ordinary routing and capability-history failure coverage active.

## Evidence
- RED route list: `npm run test:unit -- tests/unit/routing-board.test.ts -t "quietly shows demo routes"` failed before the component change because an alert still existed.
- RED capability history: `npm run test:unit -- tests/unit/routing-board.test.ts -t "quietly keeps route capability open"` failed before the component change because an alert still existed.
- GREEN route list -> 1 passed.
- GREEN capability history -> 1 passed.
- Fail-loud guards:
  - `npm run test:unit -- tests/unit/routing-board.test.ts -t "route list loading fails"` -> 1 passed.
  - `npm run test:unit -- tests/unit/routing-board.test.ts -t "capability validation history loading fails"` -> 1 passed.
- `npm run test:unit -- tests/unit/routing-board.test.ts` -> 16 passed.
- Offline demo regression bundle -> 393 passed.
- `npm run build` -> passed.
- Real browser:
  - `/scheduling/routing?offlineDemo=1`
  - `hasBackendSkip: false`
  - `hasRouteListFailure: false`
  - `hasCapabilityFailure: false`
  - `alertCount: 0`
  - `optionCount: 3`
  - demo route `R-A100 / 精密轴承组件工艺路线` visible.

## Additional Sweep Findings
- Still queued for later offline demo quiet-fallback slices:
  - `/scheduling/equipment`
  - `/scheduling/purchase`
  - `/scheduling/barcode`
  - `/scheduling/scanner`
