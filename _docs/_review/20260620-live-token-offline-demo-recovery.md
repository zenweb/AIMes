# 2026-06-20 Review: Live token offline demo recovery

## Findings

- Root cause: the runtime offline-demo gate treated persisted `aimes_offline_demo=true` as authoritative even after a valid backend login token existed. That could skip employee API reads and prevent SignalR from connecting, leaving the shell status at `离线`.
- Fix: backend skipping now requires either an explicit demo URL intent or no real backend token / a demo token. Real backend tokens are allowed to call APIs and hubs even if stale demo storage remains.
- Scope stayed surgical: only offline-demo utility, HTTP interceptor, notification store, and focused tests changed.

## Verification

- Unit tests passed: `offline-demo-mode`, `http-refresh`, `auth.store`, `employee-board`, `notifications.store`.
- Production frontend build passed.
- Real browser evidence confirmed employee live entry recovers from stale offline-demo storage and shows `实时在线`.

## Residual Risk

- `offlineDemo=1` remains intentionally authoritative for explicit demo sessions, including if a real token is present. Operators should avoid demo query links for live verification.
