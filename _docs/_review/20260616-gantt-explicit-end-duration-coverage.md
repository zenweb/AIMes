# 2026-06-16 Gantt Explicit End Duration Coverage Review

## Finding

The dhtmlx conversion layer treated `duration` as authoritative even when the schedule payload already had an explicit `end_date`.

## Impact

Real schedule windows could be visually stretched in the Gantt chart. A 12-hour task with `duration: 1` and explicit `end_date` was converted to `duration: 24`, causing the rendered bar duration to disagree with the backend schedule window.

## Fix

- `toDhtmlxTask` now calculates duration hours from `start_date` and `end_date` when `end_date` exists.
- Tasks without `end_date` keep the existing day-to-hour conversion path.
- A minimum dhtmlx duration of `0.25` hours is still preserved.

## Verification

- Red/green test cycle completed for the explicit-end-date case.
- Gantt targeted suite passed: `26 passed`.
- Full frontend suite passed: `111 files / 1053 tests passed`.

## Remaining Risk

- `GanttChart.vue` branch coverage remains modest at `58.78%`; this slice closed a real schedule-window defect, not every remaining branch.
- Strict v1.0.0 release readiness is still not claimed because gray observation remains owner-deferred.
