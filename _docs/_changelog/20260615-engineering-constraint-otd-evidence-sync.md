# 2026-06-15 Engineering Constraint OTD Evidence Sync

## Change

- Added focused success-state coverage for `EngineeringConstraintPanel.vue`.
- Locked the existing engineering-constraint-to-OTD-evidence path:
  - BOM constraints write `ready / 已引用`.
  - route constraints write `ready / 已约束排产`.
  - labor constraints write `active / 待资质复核`.
  - generated evidence keeps stable ids, source objects, and trace ids.
- Existing failure alert coverage remains in place.

## Evidence

```powershell
npm run test:unit -- tests/unit/engineering-constraint-panel.test.ts
# 1 file passed, 2 tests passed

npm run test:unit:coverage -- tests/unit/engineering-constraint-panel.test.ts --coverage.include=src/components/schedule/EngineeringConstraintPanel.vue
# EngineeringConstraintPanel.vue statements 100%, branches 100%, functions 100%, lines 100%
```

