# Start qualification reassignment issue note

## Issue

The start qualification panel had coverage for blocked qualification, but not for the approved reassignment path that releases production start while preserving audit traceability.

## Impact

- A regression could accidentally announce approved reassignment as blocking, omit reassignment audit IDs, or hide batch-material warning context.
- Operators could lose the distinction between "cannot start" and "can start after approved replacement".

## Resolution

- Added a test for `status: pass` with reassignment audit and trace IDs.
- Verified `role=status`, `aria-live=polite`, reassignment audit details, warning gate labels, and absence of blocked audit UI.
