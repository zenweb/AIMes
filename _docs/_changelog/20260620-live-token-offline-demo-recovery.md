# 2026-06-20 Changelog: Live token offline demo recovery

## Changed

- Added `shouldSkipBackendForOfflineDemo(accessToken)` so stale `aimes_offline_demo=true` no longer blocks live API calls when a real backend token exists.
- Aligned the HTTP request interceptor and notification SignalR startup with the same offline-demo decision rule.
- Kept explicit demo entry (`offlineDemo=1`) and demo tokens as backend-skipping demo mode.

## Evidence

- `npm run test:unit -- tests/unit/offline-demo-mode.test.ts tests/unit/http-refresh.test.ts tests/unit/auth.store.test.ts tests/unit/employee-board.test.ts tests/unit/notifications.store.test.ts`: PASS, 72 tests.
- `npm run build`: PASS.
- Real browser `http://127.0.0.1:4173/scheduling/employee` with stale `aimes_offline_demo=true` and a real backend token:
  - `/api/v1/employee?page=1&pageSize=20`: requested successfully through `4173`.
  - `/hubs/notifications/negotiate`: requested successfully against `5003`.
  - Shell status showed `实时在线`.
  - No `员工列表加载失败`.
  - No `Offline demo mode skipped backend request`.
