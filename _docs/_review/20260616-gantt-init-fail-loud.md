# 2026-06-16 Gantt Init Fail Loud Review

## Finding

Real dhtmlx Gantt initialization had no error boundary.

## Impact

If `gantt.init` failed in a real browser environment, the schedule timeline could crash during mount before the existing parse/render fail-loud paths had a chance to run. Planners would lose the core schedule view without a clear recovery message.

## Fix

- `initGantt` now returns whether initialization succeeded.
- `gantt.init` is wrapped in `try/catch` and writes a visible alert on failure.
- Mounted loading only calls `loadData` when initialization succeeded.

## Verification

- Red/green test cycle completed.
- Gantt targeted suite passed: `27 passed`.
- Full frontend suite passed: `111 files / 1058 tests passed`.

## Remaining Risk

- `GanttChart.vue` branch coverage remains low at `58.57%`; future slices should keep targeting real schedule-view failure modes rather than residual line chasing.
- Strict v1.0.0 release readiness is still not claimed because gray observation remains owner-deferred.
