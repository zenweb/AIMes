# 2026-06-15 Equipment audit focus current work order coverage

## Changed

- Added an EquipmentBoard regression test for audit replay deep-linking to a missing equipment object.
- Made the route query mock controllable in `equipment-board.test.ts`.
- Added the selected equipment current work order to the overview detail panel so audit-focused synthetic equipment exposes the trace/work-order reference after selection.

## Verification

- RED: `npm run test:unit -- tests/unit/equipment-board.test.ts --reporter=dot` failed because the detail panel did not include `TRACE-EQ-DOWNTIME-20260615`.
- GREEN: `npm run test:unit -- tests/unit/equipment-board.test.ts --reporter=dot` => 1 file / 12 tests passed.
- Full coverage: `npm run test:unit:coverage -- --reporter=dot` => 111 files / 962 tests passed.

## Coverage

- Total after this slice: statements 87.16%, branches 73.61%, functions 86.41%, lines 90.45%.
- `EquipmentBoard.vue`: statements 85.77%, branches 79.20%, functions 82.60%, lines 90.27%.

## Notes

- PostgreSQL/staging release gate is still blocked by Docker Desktop Linux engine API 500 evidence from `_docs/_reports/staging-rehearsal-20260615-5003-docker-api-500.md`.
