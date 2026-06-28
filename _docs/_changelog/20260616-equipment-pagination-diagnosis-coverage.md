# 2026-06-16 Equipment Pagination And Diagnosis Coverage

- Added focused unit evidence for `EquipmentBoard.vue` pagination from page 1 to page 2.
- Added focused unit evidence for successful backend equipment fault diagnosis, including cause, basis, suggested steps, spare parts, and repair time.
- Improved targeted EquipmentBoard coverage isolation by mocking `EquipmentScheduleImpactPanel.vue` at module level. That panel keeps its own dedicated tests, so this board suite now measures the board path directly.
- Production code was not changed.

## Verification

- Targeted new tests: `npm run test:unit -- tests/unit/equipment-board.test.ts -t "loads the next equipment page|renders backend diagnosis advice" --reporter=dot`
  - Result: `2 passed | 12 skipped`.
- Targeted EquipmentBoard coverage: `npm run test:unit:coverage -- tests/unit/equipment-board.test.ts --reporter=dot --coverage.reporter=text`
  - Result: `1 file / 14 tests passed`.
  - `EquipmentBoard.vue`: statements `89.83%`, branches `84.15%`, functions `93.47%`, lines `93.98%`.
- Full frontend coverage: `npm run test:unit:coverage -- --reporter=dot`
  - Result: `111 files / 1045 tests passed`.
  - Totals: statements `89.16%`, branches `76.27%`, functions `89.06%`, lines `92.32%`.
