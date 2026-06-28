# Issue - Report API contract coverage

## Problem
- `src/frontend/src/api/report.ts` is the frontend boundary for release-facing dashboard evidence, but lacked a direct unit contract test.
- A path drift or swallowed backend failure could weaken ReportBoard evidence while component mocks still pass.

## Impact
- Report dashboard evidence is used during review and release-readiness checks.
- Weak direct helper evidence increases review burden for the 1 person + AI execution model.

## Fix
- Added `report-api.test.ts` to lock endpoint path, returned `data`, and error propagation.
- Re-ran ReportBoard unit regression to verify the caller layer remains green.

## Verification
- Focused report API test: 2 passed.
- ReportBoard regression: 19 passed.
- Full frontend unit coverage: 107 files / 793 tests passed; global line coverage 84.31%.
