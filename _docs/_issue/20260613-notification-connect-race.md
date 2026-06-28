# 2026-06-13 Issue: Notification connected state race

## Status

Closed for this slice.

## Finding

Two notification connection races were confirmed:

- If `disconnect()` was called before SignalR `start()` resolved, the delayed success callback could set `connected` back to `true`.
- If the old SignalR connection still reported `Connected` after `disconnect()`, a later `connect()` could return early and skip reconnect.
- If a stale SignalR lifecycle callback fired after `disconnect()`, `onreconnected` could set `connected` back to `true`.
- If offline demo mode was enabled while SignalR `start()` was still pending, the delayed start completion could still mark the offline UI connected.

## Resolution

Added a connection generation guard, applied it to start completion and lifecycle callbacks, invalidated pending starts when offline demo mode is active, and cleared the stale connection reference on `disconnect()`. `connect()` only marks the store connected when the resolved start belongs to the current generation, stale lifecycle callbacks are ignored, offline mode invalidates pending live starts, and reconnect can build a fresh connection after disconnect.

## Verification

- Both regression tests failed before their fixes and passed after the fixes.
