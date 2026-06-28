# 2026-06-15 Changelog: Quality CAPA closure coverage

- Added QualityCapaTaskPanel tests for open-task start, verified-task no-op protection, reuse draft formal CAPA success, reuse effect verification success, low-score review queue create/close success, gray release recommendation adoption success, and assistant quality action closure success.
- No production component code was changed in this slice.

## Coverage

- Before: `QualityCapaTaskPanel.vue` statements 74.82%, branches 59.42%, functions 76.47%, lines 77.51%.
- After: `QualityCapaTaskPanel.vue` statements 92.08%, branches 71.01%, functions 82.35%, lines 95.34%.

## Validation

- `npm run test:unit -- tests/unit/quality-capa-task-panel.test.ts`: 17 passed.
- `npm run test:unit:coverage -- tests/unit/quality-capa-task-panel.test.ts --coverage.include=src/components/quality/QualityCapaTaskPanel.vue`: 17 passed.
- `npm run test:unit:coverage -- --reporter=dot`: 111 files passed, 889 tests passed; global coverage statements 84.1%, branches 69.45%, functions 81.81%, lines 87.43%.
