# Plan: DocumentUpload shadow gray decision refresh evidence

Date: 2026-06-19
Status: Completed

## Success criteria

- Successful R7 shadow gray publish refreshes gray decision evidence.
- Refreshed decision evidence reaches the governance panel contract.
- Upload and quality governance regressions remain green.

## Implementation

- Added a focused unit test with a governance panel probe stub.
- Opened the existing `readQualityKnowledgeGrayReleaseDecisionRecords` mock so the post-publish refresh could be asserted.
- No production code change was required.

## Verification

- `npx vitest run tests/unit/document-upload.test.ts --coverage.enabled=false -t "refreshes gray decision evidence"` passed.
- `npx vitest run tests/unit/document-upload.test.ts --coverage.enabled=false`: 33 passed.
- `npm run test:unit:coverage`: 111 files / 1072 tests passed.
- `npm run lint`: passed.
