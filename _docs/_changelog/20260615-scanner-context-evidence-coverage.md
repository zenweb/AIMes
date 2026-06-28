# 2026-06-15 Changelog: Scanner context evidence coverage

## Changed

- Added focused unit evidence for `ScannerBoard` successful scan evidence refresh and context navigation.
- Covered backend-refreshed work order scan evidence after successful local write.
- Covered material scan context actions to inventory and BOM.
- Covered equipment scan context actions to equipment detail and monitoring.

## Verification

- Focused `ScannerBoard` coverage before this slice: statements 77.3%, branches 59.25%, functions 72.22%, lines 82.03%.
- First target run failed because the backend evidence mock was consumed by the component `onMounted` refresh before the confirmation refresh. The test mock was corrected to return an empty initial refresh and backend evidence on the confirmation refresh.
- `npm run test:unit -- tests/unit/scanner-board.test.ts` => 1 file passed, 9 tests passed.
- `npm run test:unit:coverage -- tests/unit/scanner-board.test.ts --coverage.include=src/components/scanner/ScannerBoard.vue` => statements 87.23%, branches 75%, functions 77.77%, lines 91.4%.

## Notes

- No production component logic was changed.
- This hardens the existing现场扫码入口 for work order, material, and equipment paths.
