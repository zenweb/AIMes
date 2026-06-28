# 2026-06-16 Scanner WorkOrder Context Routing Coverage Issue

## Status

Closed for this slice.

## Issue

ScannerBoard had coverage for manual scan fallback, evidence write/refresh paths, material routing, equipment routing, and camera close failure, but did not directly prove work-order scans preserve the scanned code when navigating to production and scheduling.

## Resolution

Added a focused test that scans `WO-RUSH-9001`, asserts the work-order result and arrival evidence hint, then verifies production and scheduling actions route with `scanCode=WO-RUSH-9001`.

## Verification

- Targeted new test: passed.
- Scanner targeted coverage: `10 passed`, `ScannerBoard.vue` branches `75.92%`, lines `91.4%`.
- Full frontend coverage: `111 files / 1046 tests passed`, total lines `92.32%`.

## Open Release Note

Release gate remains `PASS_WITH_DEFERRED_GRAY_OBSERVATION`; strict v1.0.0 release readiness is still not claimed.
