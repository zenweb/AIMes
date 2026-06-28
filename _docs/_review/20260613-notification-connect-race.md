# 2026-06-13 Review: Notification connect race

## Review result

The global notification connection state now resists real async races between `connect()`, `disconnect()`, lifecycle callbacks, offline demo mode transitions, and later reconnect attempts.

## Evidence covered

- A pending SignalR `start()` promise no longer flips `connected` back to `true` after `disconnect()`.
- A stale SignalR connection that still reports `Connected` no longer blocks reconnect after `disconnect()`.
- Stale `onreconnected` callbacks from an invalidated connection no longer mark notifications connected after `disconnect()`.
- Offline demo mode activation invalidates pending SignalR starts so screenshot/demo UI cannot show a stale live connected state.
- Existing browser notification icon behavior remains covered.

## Boundary

This is an existing-feature reliability hardening slice. It does not add notification features and does not claim gray observation completion.
