# 2026-06-16 Gantt Init Fail Loud Issue

## Status

Closed for this slice.

## Problem

Real Gantt initialization called `gantt.init` without an error boundary.

Scenario:

- Planner opens the scheduling view in real Gantt mode.
- dhtmlx initialization throws before data parsing.
- The component mount path aborts before existing load/render alerts can show.

Before the fix, the thrown initialization error escaped the mounted hook and `gantt.parse` was not explicitly guarded by initialization success.

## Resolution

`initGantt` now catches initialization failures, shows `甘特图初始化失败：...`, returns `false`, and mounted loading skips `loadData` when initialization fails.

## Evidence

- Regression test failed before the fix because `gantt init unavailable` escaped from the mounted hook.
- Regression test passed after the fix.
- Gantt targeted coverage passed with `27 passed`.
- Full frontend coverage passed with `111 files / 1058 tests passed`.

## Remaining Open Item

This does not close the whole CC remediation goal. Release strict readiness remains blocked by deferred gray observation.
