# Plan: Scheduling Context Operation Sequence Order

## Goal
Ensure AI scheduling context snapshots explain WIP and current executions using the same numeric operation sequence semantics as production scan handoff.

## Steps
1. Add a regression that seeds one work order with `OP-10` and `OP-2`.
2. Verify the regression fails under string ordering.
3. Sort scheduling context operation executions after materialization by work order, numeric operation sequence, operation code, and creation time.
4. Re-run the new regression plus production scan ordering checks.

## Status
- Completed on 2026-06-21.

