# Plan: Operation Code Numeric Sequence Shared Rule

## Goal
Prevent operation ordering rule drift by moving the numeric sequence extraction rule into the `OperationCode` value object.

## Steps
1. Add value-object unit tests for `OP-2`, `OP-10`, `QC-010-A`, and no-number codes.
2. Verify the tests fail before implementation.
3. Implement `OperationCode.NumericSequence`.
4. Replace three private helper implementations with the shared value object rule.
5. Run focused unit and integration tests serially.

## Status
- Completed on 2026-06-21.

