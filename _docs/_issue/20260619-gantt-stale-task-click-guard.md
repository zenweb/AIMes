# Issue: Stale dhtmlx task click callback could crash scheduling view

Date: 2026-06-19
Status: Resolved for this slice

## Problem

`GanttChart.vue` read `task.parent` directly after `gantt.getTask(id)` in the real dhtmlx click and double-click callbacks. If a schedule refresh or route transition removed the task before a stale dhtmlx callback fired, `getTask(id)` could return `undefined` and crash the scheduling view.

## Impact

Schedulers could lose the usable Gantt view while reviewing refreshed shop-floor schedules, even though the missing task should simply be ignored.

## Resolution

- Added a guard for missing task records in click and double-click callbacks.
- Preserved normal work-order click and double-click behavior for existing tasks.
- Added a regression test that reproduces the stale callback and verifies no events are emitted for removed task ids.

## Evidence

- Targeted RED reproduced the crash.
- Targeted GREEN passed after the guard.
- Full Gantt suite, full frontend coverage, and lint passed.
