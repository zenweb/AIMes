# Changelog: DocumentUpload local governance fallback evidence

Date: 2026-06-19

## Changed

- Added explicit unit evidence that local governance documents remain visible when backend quality knowledge refresh fails.
- No production behavior change was needed; this slice audits the existing fail-loud fallback contract.

## Verification

- `npx vitest run tests/unit/document-upload.test.ts --coverage.enabled=false -t "keeps local governance documents"` passed.
- `npx vitest run tests/unit/document-upload.test.ts --coverage.enabled=false` passed: 34 tests.
- `npm run test:unit:coverage` passed: 111 files / 1073 tests.
- `npm run lint` passed.
