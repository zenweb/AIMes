# Plan: DocumentUpload local governance fallback evidence

Date: 2026-06-19
Status: Completed

## Success criteria

- Backend quality evidence refresh failure raises an alert.
- Local governance documents remain visible after the failure.
- Existing upload and governance workflows remain green.

## Implementation

- Opened the `readKnowledgeGovernanceDocuments` mock for targeted assertions.
- Added a focused unit test covering preserved governance visibility during backend refresh failure.
- No production code change was required.

## Verification

- `npx vitest run tests/unit/document-upload.test.ts --coverage.enabled=false -t "keeps local governance documents"` passed.
- `npx vitest run tests/unit/document-upload.test.ts --coverage.enabled=false`: 34 passed.
- `npm run test:unit:coverage`: 111 files / 1073 tests passed.
- `npm run lint`: passed.
