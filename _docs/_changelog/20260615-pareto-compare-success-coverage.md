# 2026-06-15 Pareto Compare Success Coverage

## Change

- Added a successful backend comparison test for `ParetoCompare.vue`.
- The test locks the boutique path for multi-objective scheduling decisions:
  - two valid comparable objectives are rendered.
  - recommended objective displays a readable score and KPI evidence.
  - KPI table keeps each plan's metrics separate.
  - tab selection changes the active objective.
  - recommendation apply and row apply emit the expected objective IDs.

## Evidence

```powershell
npm run test:unit -- tests/unit/pareto-compare.test.ts
# 1 file passed, 39 tests passed

npm run test:unit:coverage -- tests/unit/pareto-compare.test.ts --coverage.include=src/components/schedule/ParetoCompare.vue
# ParetoCompare.vue lines 96.19%, branches 90.62%, functions 96.21%, statements 95.69%
```

