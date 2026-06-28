# Changelog: DocumentUpload shadow gray decision refresh evidence

Date: 2026-06-19

## Changed

- Added explicit unit evidence that a successful quality experiment shadow gray publish refreshes gray decision evidence passed into `KnowledgeGovernancePanel`.
- No production behavior change was needed; the existing refresh path is now audited.

## Verification

- `npx vitest run tests/unit/document-upload.test.ts --coverage.enabled=false -t "refreshes gray decision evidence"` passed.
- `npx vitest run tests/unit/document-upload.test.ts --coverage.enabled=false` passed: 33 tests.
- `npm run test:unit:coverage` passed: 111 files / 1072 tests.
- `npm run lint` passed.
