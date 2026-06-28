# Plan: Operation Repository Numeric Sequence Order

## Goal
Remove the remaining repository-level lexical operation ordering risk so shared operation reads do not undermine production and scheduling evidence chains.

## Steps
1. Search backend for remaining `OperationCode` ordering.
2. Add repository integration tests for list and first-operation reads with `OP-10` and `OP-2`.
3. Verify tests fail under current lexical ordering.
4. Sort repository reads by numeric operation sequence, then operation code, then creation time.
5. Re-run repository and related upper-layer tests.

## Status
- Completed on 2026-06-21.

