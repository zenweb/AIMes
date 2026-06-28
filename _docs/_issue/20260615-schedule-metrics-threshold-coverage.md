# 2026-06-15 Schedule Metrics Threshold Coverage Issue

## Issue

`ScheduleMetrics.vue` had basic status and one color-path test, but middle threshold, lower threshold, exact top threshold, and reactive value update coverage was thin.

## Impact

- A regression could miscolor utilization or on-time delivery KPI status, misleading dispatchers about scheduling health.
- A regression could stop updated KPI props from refreshing visible values.

## Resolution

- Added threshold and dynamic update tests.
- Verified focused component coverage is 100% across statements, branches, functions, and lines.

