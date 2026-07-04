# 2026-07-05 Purchase Offline Demo Leak Sweep Review

## Decision

`PASS_EXISTING_BEHAVIOR_WITH_REGRESSION_COVERAGE`

The purchase offline-demo entry was verified in a real browser. Opening `purchase?offlineDemo=1` renders the purchase board from demo data without touching `/api/v1/purchase`.

## Scope

- Route: `purchase?offlineDemo=1`
- Backend leak target: `/api/v1/purchase**`
- Test file: `src/frontend/tests/e2e/purchase.spec.ts`

## Result

- Added a Playwright regression that fails if any `/api/v1/purchase` request is made while the purchase board is entered through explicit offline-demo mode.
- No production code changed because the current implementation already preserves the expected behavior.

## Verification

```text
npm run test:e2e -- --grep "离线演示采购入口不会触达采购后端接口"
Result: 1 passed
```

## Boundary

- This closes the purchase item from the offline-demo leak sweep.
- The next sweep targets remain `/scheduling/barcode` with `/api/v1/inventory`, then `/scheduling/scanner` with `/api/v1/scheduling/barcode-scan-evidence`.
