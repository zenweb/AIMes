# 2026-06-19 Document Upload Retry Recovery

## Change
- Added in-place retry recovery for failed knowledge document uploads.
- Failed queue rows now keep the original file, show bilingual recovery guidance, link to `#knowledge-upload-help`, and provide a `重试上传` action.
- Retry resets only the failed row back to pending so operators can re-run upload without deleting and reselecting the file.

## Evidence
- RED: `npm run test:unit -- document-upload.test.ts -t "lets operators retry a failed upload"` failed because `.queue-recovery` did not exist.
- GREEN: `npm run test:unit -- document-upload.test.ts -t "lets operators retry a failed upload"` passed.
- Component suite: `npm run test:unit -- document-upload.test.ts` passed 35/35.
- Full frontend coverage: `npm run test:unit:coverage` passed 111 files / 1093 tests.
- Lint: `npm run lint` passed.
- Build: `npm run build` passed.
- Real browser production preview: `document-upload-retry-guidance-real-browser-20260619`, route `/knowledge/documents`, port 4173, preview process stopped after capture.

## Scope Boundary
- This does not claim v1.0.0 full achievement. Gray observation remains outside this slice and is still deferred/skipped by owner direction.
