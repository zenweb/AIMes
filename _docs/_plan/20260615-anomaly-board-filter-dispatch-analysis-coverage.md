# 2026-06-15 Plan - AnomalyBoard coverage leverage slice

## Objective

Harden the existing anomaly-management feature as a boutique user-critical path without broadening scope.

## Completed

- Selected AnomalyBoard because it was the lowest-covered user-critical component in the latest full frontend coverage report.
- Added focused tests for:
  - keyboard Space detail opening;
  - open filter and paginated page readback;
  - production anomaly event retention during list fallback;
  - equipment dispatch audit route;
  - material anomaly AI-analysis fallback.
- Verified focused and full frontend coverage.

## Next Selection Rule

- Pick the next component by current coverage gap and user frequency.
- Do not continue refining AnomalyBoard unless new evidence shows a real defect.

