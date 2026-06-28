# 2026-06-15 Changelog: Report quality gray experiment governance

## Changed
- Added controllable `ReportBoard` unit-test mocks for quality gray-release monitor, gray decision, experiment comparison, and experiment candidate records.
- Added focused `ReportBoard` coverage proving quality gray-release and experiment governance evidence renders in the report and exports through CSV.
- No production code changed; the existing report implementation already rendered and exported this evidence.

## Verification
- RED: `npm run test:unit -- tests/unit/report-board.test.ts -t "surfaces quality gray release and experiment governance evidence"` initially failed because the test used one-shot computed mocks and the gray monitor block disappeared on recompute.
- GREEN: `npm run test:unit -- tests/unit/report-board.test.ts -t "surfaces quality gray release and experiment governance evidence"`: 1 passed.
- `npm run test:unit -- tests/unit/report-board.test.ts`: 27 passed.
- `npm run test:unit:coverage -- tests/unit/report-board.test.ts`: 27 passed; `ReportBoard.vue` lines `93.78%`.
