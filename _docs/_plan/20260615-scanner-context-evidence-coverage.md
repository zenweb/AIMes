# 2026-06-15 Plan: Scanner context evidence coverage

## Goal

Harden the existing barcode scanner workflow so field users can scan work orders, materials, and equipment with auditable evidence and correct context navigation.

## Success Criteria

- Successful work order scan evidence refreshes from backend after confirmation.
- Material scans show the material evidence hint and route to inventory/BOM.
- Equipment scans show the equipment evidence hint and route to equipment/monitoring.
- Focused coverage improves materially without production changes.

## Result

- Added three focused tests to `src/frontend/tests/unit/scanner-board.test.ts`.
- `npm run test:unit -- tests/unit/scanner-board.test.ts` passed.
- `npm run test:unit:coverage -- tests/unit/scanner-board.test.ts --coverage.include=src/components/scanner/ScannerBoard.vue` reported statements 87.23%, branches 75%, functions 77.77%, lines 91.4%.

## Next Route

Continue selecting low-coverage, user-critical existing paths from the full coverage table. Do not retry live scanner/browser evidence until the local AIMes runtime is actually available on host `5002`.
