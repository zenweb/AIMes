# 2026-06-15 EquipmentBoard health / maintenance coverage

## Changed
- Added EquipmentBoard unit coverage for successful backend health-monitor rendering.
- Added EquipmentBoard unit coverage for successful backend maintenance-history rendering.
- Verified that health anomalies, predicted failures, maintenance result, cost, and spare parts are visible for the selected equipment.

## Validation
- `npm run test:unit -- tests/unit/equipment-board.test.ts` -> 11 passed.
- `npm run test:unit:coverage -- tests/unit/equipment-board.test.ts --coverage.include=src/components/equipment/EquipmentBoard.vue --coverage.reporter=json-summary --coverage.reporter=text-summary` -> EquipmentBoard statements 82.04%, branches 71.71%, functions 80.43%, lines 86.51%.
- `npm run test:unit:coverage -- --reporter=dot` -> 111 files, 936 tests passed; all-files statements 86.29%, branches 71.95%, functions 85.49%, lines 89.58%.

## Notes
- No production component code was changed.
- This slice complements the existing backend-failure fallback tests with successful backend evidence.
