# Plan - BOM startup and list failures aggregate

## Success Criteria
- Startup engineering evidence failure remains visible if BOM list loading later fails.
- BOM list fallback still shows local BOM records.
- Operation-specific errors continue to clear independently.
- Evidence includes focused unit, full BOM unit, focused Chromium, full engineering-data Chromium, and full unit coverage.

## Execution
- RED: add BOM unit test for simultaneous startup evidence and list fallback failures.
- GREEN: split BOM alert state into startup/list/operation lanes.
- Browser: add Chromium test for the same combined failure path.
- Verify: run BOM unit suite, engineering-data Chromium suite, and full coverage.

## Result
- Completed.
- Global unit coverage: 84.18% lines.
- `BomBoard.vue`: 79.66% lines.
