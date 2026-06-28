# Plan - Purchase list fallback alert persists

## Success Criteria
- Initial purchase list API failure remains visible after fallback demo data is shown.
- Later successful purchase confirmation must not clear that startup-level warning.
- Existing operation alerts continue to use the operation lane.
- Evidence includes focused unit, full unit, focused Chromium, full Chromium, and coverage.

## Execution
- RED: add unit test for initial list fallback alert persistence after successful confirmation.
- GREEN: move initial list fallback warning to startup fail-loud lane.
- Browser: add Chromium test for the same user path.
- Verify: run PurchaseBoard unit suite, purchase Chromium suite, and full unit coverage.

## Result
- Completed.
- Global unit coverage remains 84.19% lines.
- `PurchaseBoard.vue` remains 78.5% lines; this slice improves correctness and evidence more than raw line coverage.
