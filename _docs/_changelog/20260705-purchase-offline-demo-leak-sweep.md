# 2026-07-05 Purchase Offline Demo Leak Sweep Changelog

## Added

- Added a Playwright regression proving `purchase?offlineDemo=1` does not call `/api/v1/purchase`.
- Added `_docs/_review/20260705-purchase-offline-demo-leak-sweep.md`.

## Verified

- `npm ci`: completed in the clean sync worktree so the focused browser test could run.
- `npm run test:e2e -- --grep "离线演示采购入口不会触达采购后端接口"`: `1 passed`.

## Result

- Purchase offline-demo leak sweep: `PASS`.
- No production code changed.
