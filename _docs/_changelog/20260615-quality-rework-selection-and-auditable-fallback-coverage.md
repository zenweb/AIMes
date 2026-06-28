# 2026-06-15 Quality Rework Selection and Auditable Fallback Coverage

## Changed

- Added business-meaningful regression coverage for quality rework selection and backend-first fallback behavior.
- Covered both the freshness comparison between backend/local evidence and the hard-fail rework path with frozen-process evidence.

## Validation

- `npm run test:unit -- tests/unit/quality-rework-sync.test.ts --reporter=dot`
- `npm run test:unit -- tests/unit/quality-board.test.ts tests/unit/quality-rework-impact-panel.test.ts tests/unit/report-board.test.ts tests/unit/schedule-board.test.ts --reporter=dot`
- `npm run test:unit -- --reporter=dot`
- `npm run test:unit:coverage -- --reporter=dot`

## Result

- Targeted quality rework tests: 9 passed.
- Related quality/report/schedule tests: 116 passed.
- Full frontend unit suite: 111 files / 997 tests passed.
- Full frontend coverage: statements 87.75%, branches 74.28%, functions 87.19%, lines 90.98%.
- `src/utils/quality-rework-sync.ts`: statements 87.75%, branches 87.8%, functions 90.9%, lines 94.87%.

## Boundary

This keeps the existing quality evidence path auditable. It does not broaden product scope.
