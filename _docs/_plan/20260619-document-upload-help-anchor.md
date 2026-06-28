# Plan: DocumentUpload help anchor closure

Date: 2026-06-19
Status: Completed

## Success criteria

- `知识治理队列` link resolves to a real governance panel anchor.
- `帮助：知识入库支持` resolves to a real help section.
- Help section contains Simplified Chinese and English operator guidance.
- Existing DocumentUpload workflows remain green.

## Implementation

- Added `#knowledge-governance` wrapper around `KnowledgeGovernancePanel`.
- Added `#knowledge-upload-help` section with bilingual upload guidance.
- Added focused unit coverage for both targets.

## Verification

- Target RED/GREEN cycle completed.
- `npx vitest run tests/unit/document-upload.test.ts --coverage.enabled=false`: 31 passed.
- `npm run test:unit:coverage`: 111 files / 1070 tests passed.
- `npm run lint`: passed.
