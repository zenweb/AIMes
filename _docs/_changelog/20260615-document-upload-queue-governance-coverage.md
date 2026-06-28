# 2026-06-15 Changelog: Document upload queue and governance coverage

- Added DocumentUpload coverage for drag/drop queueing, duplicate-file suppression, drag state cleanup, and queued-file removal.
- Added coverage for clearing the queue while an upload is in flight, preserving the uploading evidence row instead of discarding it.
- Added coverage proving successful uploads enter the knowledge governance review queue with the selected document category.

Verification:
- `npm run test:unit -- tests/unit/document-upload.test.ts`: 29 passed.
- `npm run test:unit:coverage -- tests/unit/document-upload.test.ts --coverage.include=src/components/knowledge/DocumentUpload.vue --coverage.reporter=json-summary --coverage.reporter=json`: passed.
- Focused DocumentUpload coverage: statements 82.67%, branches 66.66%, functions 87.30%, lines 87.23%.
- `npm run test:unit:coverage -- --reporter=dot`: 111 files passed, 908 tests passed; global lines 88.40%.
