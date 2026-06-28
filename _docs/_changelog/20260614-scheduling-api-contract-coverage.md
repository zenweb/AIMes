# 20260614 Scheduling API contract coverage

## Change
- Added scheduling API contract coverage for current plan, plan list, plan detail, equipment paging, work-order reads, optimization, compare optimization, feedback submission, drag reschedule, and Agent decision lifecycle endpoints.
- Locked default paging for equipment reads and Agent decision reads.
- Kept production code unchanged because the current API helper implementation already matched the expected contract.

## Evidence
- `npm run test:unit -- tests/unit/scheduling-api.test.ts`: 6 passed.
- `npm run test:unit:coverage -- tests/unit/scheduling-api.test.ts`: 6 passed; focused coverage 100% lines / 100% functions for the measured scheduling API helper slice.
- `npm run test:unit -- tests/unit/schedule-agent-workbench-panel.test.ts tests/unit/pareto-compare.test.ts tests/unit/schedule-board.test.ts`: 83 passed.
- `npm run test:unit:coverage`: 106 files / 786 tests passed; global line coverage 84.29%.

## Coverage Delta
- Previous full coverage after the latest-feedback startup slice: 106 files / 781 tests, global line coverage 84.01%.
- Current full coverage: 106 files / 786 tests, global line coverage 84.29%.

## Fail Loud
- Known warning remains: `--localstorage-file was provided without a valid path`.
- No production code changed in this slice.
