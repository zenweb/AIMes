# Issue: Scheduling Context Operation Sequence Order

## Problem
`SchedulingContextProvider` ordered operation executions lexically by `OperationCode`.

## Impact
For non-padded operation codes, `OP-10` could appear before `OP-2` in scheduling WIP and current execution snapshots. That weakens the backend-backed evidence chain used by AI scheduling explanations and production handoff review.

## Resolution
Materialized relevant operation executions and sorted them in memory by:
- work order id
- extracted numeric operation sequence
- operation code
- creation time

## Verification
- New regression failed before the fix with `{"OP-10", "OP-2"}`.
- New regression passed after the fix with `{"OP-2", "OP-10"}`.

