# 2026-06-13 Plan: Notification connect race

## Success criteria

- Pick an existing low-coverage, user-critical path after gray observation was deferred.
- Reproduce real reliability gaps with failing tests before editing production code.
- Apply the smallest production fix and verify the target test.

## Result

- Selected the global notification store because it is a cross-page feedback channel and had weaker coverage.
- Added connect/disconnect, disconnect/reconnect, stale lifecycle callback, and offline demo transition race regressions.
- Fixed stale SignalR start completion with a generation guard.
- Fixed stale connection reuse by clearing the connection reference on disconnect.
- Fixed stale lifecycle callback state writes with the same generation guard.
- Fixed offline demo transition state writes by invalidating pending live starts.
