# 2026-06-15 Changelog: Report quality CAPA closure coverage

## Changed
- Added `ReportBoard` unit coverage for quality CAPA closure evidence entering the OTD review report.
- Made the `quality-capa-sync` mock controllable in `report-board.test.ts` so CAPA evidence can be exercised without leaking state across tests.

## Verification
- `npm run test:unit -- tests/unit/report-board.test.ts -t "surfaces quality CAPA closure"`: 1 passed.
- `npm run test:unit -- tests/unit/report-board.test.ts`: 21 passed.
- `npm run test:unit -- tests/unit/quality-capa-sync.test.ts`: 4 passed.
- `npm run test:unit:coverage -- tests/unit/report-board.test.ts`: 21 passed; `ReportBoard.vue` lines `78.71%`.
