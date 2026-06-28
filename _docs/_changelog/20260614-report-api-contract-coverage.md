# 20260614 Report API contract coverage

## Change
- Added direct contract coverage for `src/api/report.ts`.
- Locked the report dashboard endpoint path, returned data passthrough, and backend failure propagation.
- Kept production code unchanged because the helper already matched the expected contract.

## Evidence
- `npm run test:unit -- tests/unit/report-api.test.ts`: 2 passed.
- `npm run test:unit -- tests/unit/report-board.test.ts`: 19 passed.
- `npm run test:unit:coverage -- tests/unit/report-api.test.ts`: 2 passed; focused coverage 100% lines / 100% functions for the report API helper.
- `npm run test:unit:coverage`: 107 files / 793 tests passed; global line coverage 84.31%.

## Coverage Delta
- Previous full coverage after anomaly API contract coverage: 106 files / 791 tests, global line coverage 84.31%.
- Current full coverage: 107 files / 793 tests, global line coverage 84.31%.

## Fail Loud
- This is a test-evidence slice only; no production code changed.
- Browser evidence was not rerun because rendered UI behavior did not change.
