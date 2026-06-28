# 2026-06-23 Purchase E2E Live Fixture Closure

## Changed

- Closed the Purchase real-browser E2E red cluster in `src/frontend/tests/e2e/purchase.spec.ts`.
- Kept protected Purchase entry under `offlineDemo=1` for normal page initialization.
- Added action-level live/mock switching for purchase create, confirm, and receive failure assertions.
- Added isolated live API fixtures for the detail-recovery and list-recovery cases so unrelated layout/startup requests cannot trigger auth redirects.

## Root Cause

- Purchase action tests need the axios live path to hit Playwright route mocks, but protected page entry needs offline demo initialization.
- Switching the whole page to `offlineDemo=0` before or during reload caused unrelated global/startup API requests to reach live backend paths.
- Unmocked live requests returned `401`, triggered refresh failure, cleared local auth, and bounced the browser between `/scheduling/login` and `/scheduling/dashboard`.

## Evidence

- `npm run test:e2e -- tests/e2e/purchase.spec.ts -g "详情加载失败后再次选择成功"` passed: 1 Chromium test.
- `npm run test:e2e -- tests/e2e/purchase.spec.ts -g "列表首次降级"` passed: 1 Chromium test.
- `npm run test:e2e -- tests/e2e/purchase.spec.ts` passed: 13 Chromium tests.

## Release Impact

- Improves real-browser evidence for Purchase fail-loud behavior, list/detail recovery, and cross-module purchase evidence flows.
- Does not prove full frontend E2E completion; full-suite evidence is still required.
