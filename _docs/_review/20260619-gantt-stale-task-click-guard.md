# Review: Gantt stale task click guard

Date: 2026-06-19

## Findings

- No blocking issue found in this slice.
- The change is scoped to real dhtmlx click and double-click callbacks.
- It preserves normal work-order click and double-click emissions while preventing stale ids from crashing the scheduling view.

## Residual Risk

- This slice is unit verified. It does not add a new browser recording because the covered failure is an internal dhtmlx callback race after refresh/removal.
- Strict v1.0.0 release readiness is still not claimed while the gray observation gate remains owner-deferred.

## Verification

- Targeted RED/GREEN completed.
- Gantt unit suite passed: 29 tests.
- Full frontend coverage passed: 111 files / 1083 tests.
- Lint passed.
