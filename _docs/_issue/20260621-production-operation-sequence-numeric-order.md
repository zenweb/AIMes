# 2026-06-21 Issue - Production operation sequence numeric order

## Issue

The production scan next-operation readback could depend on string ordering of operation codes. With non-padded route codes, `OP-10` can sort before `OP-2`, causing the wrong current or downstream operation to be selected.

## Impact

- Barcode handoff evidence could point to an incorrect downstream step for real customer route data.
- Work-order scan could start from a later operation if codes are not zero-padded.

## Resolution

- Added application-level numeric sequence extraction from `OperationCode`.
- Applied that ordering to both first-operation selection and next-operation lookup.
- Added regression coverage proving `OP-2 -> OP-10` behavior even when repository data arrives in the opposite order.
