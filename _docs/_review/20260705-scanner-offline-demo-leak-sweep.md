# 2026-07-05 Scanner Offline Demo Leak Sweep Review

## Decision

`PASS_EXISTING_BEHAVIOR_WITH_REGRESSION_COVERAGE`

The scanner offline-demo entry was verified in a real browser. Opening `scanner?offlineDemo=1` renders the scanner board from demo/local state without touching `/api/v1/scheduling/barcode-scan-evidence`.

## Scope

- Route: `scanner?offlineDemo=1`
- Backend leak target: `/api/v1/scheduling/barcode-scan-evidence**`
- Test file: `src/frontend/tests/e2e/scanner.spec.ts`

## Result

- Added a Playwright regression that installs the backend route guard before page navigation, so startup evidence refresh leaks are observable.
- No production code changed because the current implementation already preserves the expected behavior.

## Verification

```text
npm run test:e2e -- --grep "离线演示扫码入口不会触达扫码证据后端接口"
Result: 1 passed
```

## Boundary

- This closes the scanner item from the offline-demo leak sweep.
- The purchase, barcode, and scanner offline-demo leak sweep now each have focused real-browser regression coverage.
- This evidence does not replace live deployment observation for `DeviceDataIocTask` false-failure logs or queue-head blocking/isolation behavior.
