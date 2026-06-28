# 2026-06-15 Pareto Compare Success Coverage Issue

## Issue

Focused coverage routing showed `ParetoCompare.vue` as a low-coverage scheduling decision component, while existing tests were weighted heavily toward backend-contract fail-loud cases.

## Impact

- A valid backend comparison could regress in rendered KPI evidence, active objective switching, or apply-event routing without a focused success-state assertion.

## Resolution

- Added a success-state test that renders two valid comparable objectives and verifies recommendation evidence, KPI separation, tab activation, and emitted objective IDs.

