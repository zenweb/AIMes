# 2026-06-16 Gantt Explicit End Duration Coverage Issue

## Status

Closed for this slice.

## Problem

When a Gantt task carried an explicit backend schedule window, the dhtmlx mapper still used the internal day-based `duration` as the rendered duration source.

Example:

- `start_date`: `2026-06-02 08:00`
- `end_date`: `2026-06-02 20:00`
- `duration`: `1`

Before the fix, dhtmlx received `duration: 24` instead of `12`.

## Resolution

`toDhtmlxTask` now derives `duration` from `end_date - start_date` when `end_date` is present.

## Evidence

- Regression test failed before the fix with `duration: 24`.
- Regression test passed after the fix.
- Gantt targeted coverage passed with `26 passed`.
- Full frontend coverage passed with `111 files / 1053 tests passed`.

## Remaining Open Item

This does not close the whole CC remediation goal. Release strict readiness remains blocked by deferred gray observation.
