# 2026-06-30 Scheduling E2E Offline Demo / Live Backend Closure

- Fixed Scheduling E2E setup so fail-loud backend evidence cases enter with `offlineDemo=0` instead of being intercepted by offline demo mode.
- Updated the batch optimize feedback mock to match the current recommendation score contract.
- Verified `tests/e2e/scheduling.spec.ts` with 36/36 passing in real Chromium.
