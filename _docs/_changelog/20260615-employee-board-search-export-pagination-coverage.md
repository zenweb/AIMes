# 2026-06-15 Changelog: EmployeeBoard search/export/pagination coverage

- Added EmployeeBoard tests for CSV export payload, role/team/search filtering, explicit inactive employee visibility, keyboard Space activation, read-only inactive detail dialogs, and long pagination controls.
- No production component code was changed in this slice.

## Coverage

- Before: `EmployeeBoard.vue` statements 69.59%, branches 66.25%, functions 48%, lines 79.69%.
- After: `EmployeeBoard.vue` statements 91.81%, branches 90%, functions 82%, lines 96.24%.

## Validation

- `npm run test:unit -- tests/unit/employee-board.test.ts`: 17 passed.
- `npm run test:unit:coverage -- tests/unit/employee-board.test.ts --coverage.include=src/components/employee/EmployeeBoard.vue`: 17 passed.
- `npm run test:unit:coverage -- --reporter=dot`: 111 files passed, 874 tests passed; global coverage statements 83.6%, branches 69.05%, functions 81%, lines 86.95%.
