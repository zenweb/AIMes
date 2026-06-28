# 2026-06-15 Review: PurchaseBoard create/export/audit coverage

## Findings

- PurchaseBoard had weak function coverage on user-critical procurement paths despite broad failure-path coverage.
- Missing evidence covered normal operator workflows: export, create with material lines, keyboard selection, pagination refresh, audit replay targeting, and local shortage-expedite fallback.

## Review Result

- Added focused tests for existing behavior only.
- The slice materially improved `PurchaseBoard.vue` function coverage from 58.75% to 85%.

## Residual Risk

- Remaining uncovered lines are mostly modal cancel paths, long pagination rendering, and some downstream recovery summaries. These are lower leverage than moving to another low-coverage user-critical component.
