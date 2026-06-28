# 2026-06-13 Changelog: Notification connect race

## Changed

- Hardened `src/stores/notifications.ts` so a delayed SignalR `start()` completion cannot mark notifications connected after the user has already disconnected.
- Cleared the stale SignalR connection reference on `disconnect()` so a later `connect()` is not blocked by an old connection that still reports `Connected`.
- Guarded SignalR lifecycle callbacks with the same connection generation check, so stale `onreconnected` callbacks cannot mark notifications connected after disconnect.
- Invalidated pending SignalR starts when offline demo mode becomes active, preventing stale live connections from marking the offline UI connected.
- Added a focused unit regression test for the connect/disconnect race.
- Added a reconnect regression test for disconnect-then-connect recovery.
- Added a stale lifecycle callback regression test.
- Added an offline demo mode transition regression test.

## Verification

- RED observed: `npm run test:unit -- tests/unit/notifications.store.test.ts` failed because `connected` became `true` after disconnect.
- RED observed: `npm run test:unit -- tests/unit/notifications.store.test.ts` failed because reconnect after disconnect was skipped when the old connection still reported `Connected`.
- RED observed: `npm run test:unit -- tests/unit/notifications.store.test.ts` failed because a stale `onreconnected` callback set `connected` back to `true` after disconnect.
- RED observed: `npm run test:unit -- tests/unit/notifications.store.test.ts` failed because enabling offline demo mode during a pending SignalR start still allowed `connected` to become `true`.
- GREEN observed: `npm run test:unit -- tests/unit/notifications.store.test.ts` => 5 passed.
- `npm run test:unit -- tests/unit/notifications.store.test.ts tests/unit/offline-demo-mode.test.ts tests/unit/router-auth.test.ts` => 18 passed.
- `npm run test:unit:coverage -- tests/unit/notifications.store.test.ts` => 5 passed; focused `notifications.ts` line coverage is 69.51%.
