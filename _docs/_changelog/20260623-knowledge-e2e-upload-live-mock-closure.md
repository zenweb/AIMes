# 2026-06-23 Knowledge E2E Upload Live Mock Closure

## Changed

- Closed the Knowledge real-browser upload red cluster in `src/frontend/tests/e2e/knowledge.spec.ts`.
- Added a focused helper that switches only the upload action from offline demo mode to live/mock request mode by updating the current browser URL intent and local auth tokens immediately before clicking upload.

## Root Cause

- The Knowledge page defaults to `offlineDemo=1` for protected-route demo entry.
- Earlier attempts switched the whole page to `offlineDemo=0`, which caused mounted evidence refresh calls to hit live backend paths and bounce through auth redirects.
- Switching only `localStorage` was insufficient because `shouldSkipBackendForOfflineDemo` gives URL intent priority over stored mode.

## Evidence

- `npm run test:e2e -- tests/e2e/knowledge.spec.ts -g "上传"` passed: 2 Chromium tests.
- `npm run test:e2e -- tests/e2e/knowledge.spec.ts` passed: 21 Chromium tests.

## Release Impact

- Improves frontend real-browser evidence for Knowledge upload success and fail-loud behavior.
- Does not prove full frontend E2E completion; full-suite evidence is still required.
