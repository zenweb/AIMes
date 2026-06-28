# 2026-06-19 Issue: Quality knowledge formal publish lacked backend readback

## Problem
- Formal quality knowledge retraining publish wrote local publish evidence and updated local history, but did not re-read the backend retraining-version records afterward.
- A backend readback outage could be missed while the operator saw the publish history as successful.

## Impact
- The AI recommendation path depends on the published training-set evidence.
- Without a readback warning, operators could assume the backend publish evidence was readable when it was not.

## Resolution
- Added a post-publish backend readback after formal publish succeeds.
- On readback success, backend retraining-version records become the visible state.
- On readback failure, local publish history remains visible and a fail-loud alert tells the operator that backend readback failed.

## Verification
- `npm run test:unit -- tests/unit/document-upload.test.ts -t "fails loud but keeps local publish history when quality publish readback fails"`
- `npm run test:unit -- tests/unit/document-upload.test.ts`
- `npm run test:unit:coverage`
- `npm run lint`
- `npm run build`
