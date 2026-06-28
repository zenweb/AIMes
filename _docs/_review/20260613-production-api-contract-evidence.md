# 2026-06-13 Review: Production API contract evidence

## Review result

The production shop-floor API helper now has stronger contract evidence for the normal backend path.

## Evidence covered

- `getWorkOrders` calls `/scheduling/workorders` with status, workshop, page, and page size params.
- `scanOperation` posts the scanned code and operator to `/production/scan`.
- Start, complete, and exception operation commands post to their expected operation-specific endpoints with unchanged payloads.

## Boundary

This closes a frontend API evidence gap for an existing production path. It does not change backend behavior and does not claim gray observation completion.

