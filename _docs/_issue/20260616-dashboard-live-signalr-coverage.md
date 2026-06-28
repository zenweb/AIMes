# 2026-06-16 Dashboard Live SignalR Coverage Issue

## Status

Closed for this slice.

## Issue

The Dashboard command tower had good coverage for static command-center, backend data, A/B report, Hypercare, and demo rehearsal paths, but the live SignalR update path was previously unproven.

## Resolution

Added a unit test that switches out of offline-demo mode, verifies SignalR connection setup, pushes `KpiUpdate` and `EquipmentMetrics` handlers, asserts visible KPI/equipment state updates, and confirms connection stop on unmount.

## Verification

- Targeted new test: passed.
- Dashboard targeted coverage: `7 passed`, `DashboardBoard.vue` lines `95.09%`.
- Full frontend coverage: `111 files / 1040 tests passed`, total lines `92.23%`.

## Open Release Note

Release gate remains `PASS_WITH_DEFERRED_GRAY_OBSERVATION`; strict v1.0.0 release readiness is still not claimed.
