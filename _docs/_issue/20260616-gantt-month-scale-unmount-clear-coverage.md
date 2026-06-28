# 2026-06-16 Gantt Month Scale And Unmount Clear Coverage Issue

## Status

Closed for this slice.

## Issue

GanttChart already had broad drag, lock-period, parse, and fail-loud coverage, but two important planner acceptance behaviors were not directly asserted: long-window month review configuration and clearing real dhtmlx data when leaving the route.

## Resolution

Added tests that assert month-scale config (`scale_unit`, `date_scale`, subscales, render without alert) and unmount cleanup (`clearAll` during load and again on route leave).

## Verification

- Targeted new tests: passed.
- Gantt targeted coverage: `25 passed`, `GanttChart.vue` lines `87.21%`.
- Full frontend coverage: `111 files / 1043 tests passed`, total lines `92.24%`.

## Open Release Note

Release gate remains `PASS_WITH_DEFERRED_GRAY_OBSERVATION`; strict v1.0.0 release readiness is still not claimed.
