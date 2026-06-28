# Changelog: DocumentUpload help anchor closure

Date: 2026-06-19

## Changed

- Added a real `#knowledge-governance` anchor around the knowledge governance panel.
- Converted the knowledge upload help link into a real target section with bilingual operator guidance.
- Preserved existing upload, customer import, and quality governance behavior.

## Verification

- RED: `npx vitest run tests/unit/document-upload.test.ts --coverage.enabled=false -t "anchors knowledge governance"` failed because `#knowledge-governance` did not exist.
- GREEN: target test passed.
- `npx vitest run tests/unit/document-upload.test.ts --coverage.enabled=false` passed: 31 tests.
- `npm run test:unit:coverage` passed: 111 files / 1070 tests.
- `npm run lint` passed.
