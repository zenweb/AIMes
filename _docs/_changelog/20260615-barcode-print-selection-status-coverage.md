# 2026-06-15 Changelog: Barcode print selection and status coverage

- Added BarcodePrintBoard coverage for type filtering, text search, keyboard selection, selected styling, and selected-count feedback.
- Added coverage for newest OTD label status rendering on trace cards, including released trace styling.
- Added successful print coverage that verifies generated QR payloads, printed business text, document closing, and print invocation.

Verification:
- `npm run test:unit -- tests/unit/barcode-print-board.test.ts`: 8 passed.
- `npm run test:unit:coverage -- tests/unit/barcode-print-board.test.ts --coverage.include=src/components/barcode/BarcodePrintBoard.vue --coverage.reporter=json-summary --coverage.reporter=json`: passed.
- Focused BarcodePrintBoard coverage: statements 97.97%, branches 93.75%, functions 96.55%, lines 100%.
- `npm run test:unit:coverage -- --reporter=dot`: 111 files passed, 911 tests passed; global lines 88.54%.
