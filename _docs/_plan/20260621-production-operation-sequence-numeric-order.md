# 2026-06-21 Plan - Production operation sequence numeric order

## Goal

Prevent production barcode scan and handoff from using lexicographic operation-code order when route codes are not zero-padded.

## Success Criteria

- Non-padded `OP-2` is treated as before `OP-10`.
- Work-order scan chooses the numerically first existing operation.
- `NextOperation` uses the same numeric order.
- Backend unit and production controller integration tests pass.

## Status

Completed for this slice.
