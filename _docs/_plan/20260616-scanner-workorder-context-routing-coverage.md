# 2026-06-16 Scanner WorkOrder Context Routing Coverage Plan

## Goal

Harden the existing scanner workflow by proving scanned work orders carry context into production reporting and scheduling impact review.

## Scope

- Existing feature only: `ScannerBoard.vue`.
- No new scanner behavior.
- No production-code change unless tests expose a real defect.

## Steps

1. Establish ScannerBoard targeted coverage baseline.
2. Inspect existing scanner paths and choose a user-critical missing assertion.
3. Add focused unit evidence for work-order context actions and `scanCode` routing.
4. Verify targeted new test, targeted Scanner coverage, and full frontend coverage.
5. Update docs and task state.

## Result

Completed. Scanner work-order context routing now has direct regression evidence, and full frontend regression remains green.
