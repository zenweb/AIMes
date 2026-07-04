# 2026-07-05 Barcode Offline Demo Leak Sweep Review

## Decision

`PASS_EXISTING_BEHAVIOR_WITH_REGRESSION_COVERAGE`

The barcode offline-demo entry was verified in a real browser. Opening `barcode?offlineDemo=1` renders the barcode label board from demo data without touching `/api/v1/inventory`.

## Scope

- Route: `barcode?offlineDemo=1`
- Backend leak target: `/api/v1/inventory**`
- Test file: `src/frontend/tests/e2e/barcode.spec.ts`

## Result

- Added a Playwright regression that fails if any `/api/v1/inventory` request is made while the barcode board is entered through explicit offline-demo mode.
- No production code changed because the current implementation already preserves the expected behavior.

## Verification

```text
npm run test:e2e -- --grep "离线演示条码入口不会触达库存后端接口"
Result: 1 passed
```

## Boundary

- This closes the barcode item from the offline-demo leak sweep.
- The next sweep target remains `/scheduling/scanner` with `/api/v1/scheduling/barcode-scan-evidence`.
- This evidence does not replace the live deployment observation still needed for `DeviceDataIocTask` false-failure logs and permanent queue-head blocking.
