# Review — Document Upload Retry Recovery

## Findings
- No blocking issue found in this slice after targeted and regression validation.

## What Changed
- `DocumentUpload.vue` now exposes a recovery block for failed upload rows with bilingual instruction, help anchor, and an in-place retry button.
- `document-upload.test.ts` now proves the failed file can be retried without deleting/reselecting it, and that successful retry records upload history.

## Verification
- Target RED/GREEN test covered the missing recovery path.
- Full component suite, full frontend coverage, lint, and production build passed.
- Browser evidence confirmed the document upload page renders in production preview.

## Residual Risk
- Real browser evidence did not simulate the upload API failure row visually; that interaction is covered by unit test because production preview runs offline demo mode without a live upload backend.
