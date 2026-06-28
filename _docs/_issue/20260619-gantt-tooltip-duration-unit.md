# Issue: Gantt tooltip displayed hour-based duration as days

Date: 2026-06-19
Status: Resolved for this slice

## Problem

`GanttChart.vue` configures dhtmlx duration units as hours and maps explicit schedule windows into hour durations. The work-order tooltip still labeled `task.duration` as `天`, so a 12-hour job could be shown as `12 天`.

## Impact

Planners reviewing a schedule tooltip could misread a same-day operation as a multi-day operation, which weakens the scheduling UI's correctness and operator trust.

## Resolution

Changed the tooltip label to `小时` and added a regression test that verifies a 12-hour explicit schedule window renders as `12 小时`.

## Evidence

- Targeted RED/GREEN test completed.
- Full `GanttChart` suite passed.
- Full frontend coverage passed.
- Frontend lint passed.
