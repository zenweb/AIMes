# Changelog - Employee CSV Export Evidence - 2026-06-22

## Changed

- Added Playwright E2E coverage for employee CSV export.
- Verified the downloaded roster contains complete identity columns and active/inactive status evidence.

## Validation

- `npm run test:e2e -- tests/e2e/employee.spec.ts -g "导出员工 CSV"`: PASS, 1/1.
