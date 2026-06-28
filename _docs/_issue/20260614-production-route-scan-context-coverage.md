# Production route scan context coverage issue note

## Issue

The production route `scanCode` handoff was an existing operator path but lacked focused regression coverage. A future change could break URL-driven barcode context handoff while manual scan tests remained green.

## Resolution

- Added a route-query controlled ProductionBoard unit test.
- Covered the empty-backend-list path where a barcode work order is inserted, selected, and turned into a reporting context.

## Evidence

- `production-board.test.ts` now includes 27 ProductionBoard tests.
- Full frontend unit coverage passed with 797 tests and 84.45% line coverage.
