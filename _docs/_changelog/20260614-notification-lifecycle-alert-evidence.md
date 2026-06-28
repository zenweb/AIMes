# 2026-06-14 Notification Lifecycle Alert Evidence

## Change
- Hardened existing notification reliability evidence.
- Covered SignalR lifecycle race behavior:
  - disconnect before pending start resolves does not mark the store connected;
  - reconnect after disconnect creates a fresh connection even if the old connection reports connected;
  - stale reconnected callbacks are ignored;
  - offline demo mode invalidates pending starts.
- Added focused evidence for high-severity anomaly alert handling:
  - warning toast is emitted;
  - alert sound is attempted;
  - browser notification uses the configured app base path icon.

## Evidence
- `npm run test:unit -- tests/unit/notifications.store.test.ts`
  - 1 file passed.
  - 6 tests passed.
- `npm run test:unit:coverage -- tests/unit/notifications.store.test.ts`
  - `src/stores/notifications.ts`: statements 72.94%, branches 38.63%, functions 50.00%, lines 75.60%.
- `npm run test:unit:coverage`
  - 105 files passed.
  - 668 tests passed.
  - global statements 78.29%, branches 63.20%, functions 73.95%, lines 81.92%.
- `npm run test:e2e -- tests/e2e/anomaly.spec.ts -g "展示异常到风险、排产、质量、采购的处置闭环"`
  - Nuxt production build passed.
  - Chromium 1 test passed.

## Notes
- This slice is existing-feature hardening for notification reliability and alert evidence.
- Gray observation remains skipped/deferred by owner direction and is not used as a blocker for this work item.
