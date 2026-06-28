# 20260614 Anomaly API contract coverage

## Change
- Expanded direct contract coverage for `src/api/anomaly.ts`.
- Covered anomaly list default paging, explicit paging, critical anomaly reads, detail reads, AI analysis, return data passthrough, and backend failure propagation.
- Kept production code unchanged because the current helper implementation already matched the expected contract.

## Evidence
- `npm run test:unit -- tests/unit/anomaly-api.test.ts`: 5 passed.
- `npm run test:unit -- tests/unit/anomaly-board.test.ts`: 12 passed.
- `npm run test:unit:coverage -- tests/unit/anomaly-api.test.ts`: 5 passed; focused coverage 100% lines / 100% functions for the anomaly API helper.
- `npm run test:unit:coverage`: 106 files / 791 tests passed; global line coverage 84.31%.

## Coverage Delta
- Previous full coverage after Gantt warning cleanup: 106 files / 787 tests, global line coverage 84.29%.
- Current full coverage: 106 files / 791 tests, global line coverage 84.31%.

## Fail Loud
- This is a test-evidence slice only; no production code changed.
- Browser evidence was not rerun because rendered UI behavior did not change.
