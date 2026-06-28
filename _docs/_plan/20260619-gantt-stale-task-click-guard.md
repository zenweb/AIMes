# Plan: Gantt stale task click guard

Date: 2026-06-19

## Goal

Harden an existing user-critical scheduling interaction without broadening scope.

## Success Criteria

- A stale dhtmlx task id in click or double-click callbacks must not crash `GanttChart`.
- Existing work-order click and double-click emissions must remain unchanged.
- The regression test must fail before the production fix and pass after it.
- Gantt suite, full frontend coverage, and lint must pass.

## Execution

1. Add a RED test where `gantt.getTask()` returns `undefined` for a stale task id.
2. Confirm the failure is the current `task.parent` crash.
3. Add the smallest guard in click and double-click handlers.
4. Run targeted, component, full coverage, and lint verification.

## Result

All success criteria passed. This is a boutique hardening slice for the existing real dhtmlx scheduling workflow.
