# Production completed barcode read-only issue note

## Issue

When a scanned production context matched an already completed operation, the context stayed visible but the action area had no operator-facing explanation.

## Impact

- Operators could read the empty action area as a rendering defect or missing permission state.
- Duplicate action prevention existed implicitly, but the UI did not communicate the terminal state.

## Resolution

- Added a completed-state message: scanned operations that are already completed cannot be started or completed again.
- Added a regression test that proves no start, completion, or exception API is called for the completed scanned operation.
