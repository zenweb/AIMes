# Issue - Anomaly API contract coverage

## Problem
- The anomaly center depends on `src/api/anomaly.ts`, but direct tests previously only checked a small route-prefix scenario.
- Default paging, critical anomaly reads, detail data passthrough, AI analysis data passthrough, and backend failure propagation were not directly locked by the API helper test.

## Impact
- A helper-level endpoint or payload drift could break AnomalyBoard startup/detail/AI analysis flows while component mocks still pass.
- This increases review burden for the 1 person + AI execution model.

## Fix
- Expanded `anomaly-api.test.ts` to cover the helper contract directly.
- Re-ran AnomalyBoard unit tests to prove the caller layer remains green.

## Verification
- Focused anomaly API test: 5 passed.
- AnomalyBoard regression: 12 passed.
- Full frontend unit coverage: 106 files / 791 tests passed; global line coverage 84.31%.
