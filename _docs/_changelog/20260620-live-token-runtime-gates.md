# 2026-06-20 Changelog: Live token runtime gates

## Changed

- Moved production operation commands from raw `isOfflineDemoMode()` to token-aware backend skipping.
- Moved Dashboard monitoring SignalR startup to the shared token-aware rule.
- Moved Monitoring live/demo startup to the shared token-aware rule.
- Treated missing latest POC Hypercare acceptance (`404`) as an empty state instead of a governance initialization failure.

## Evidence

- `npm run test:unit -- tests/unit/production-api.test.ts tests/unit/dashboard-board.test.ts tests/unit/monitoring-board.test.ts tests/unit/poc-evidence-api.test.ts tests/unit/poc-hypercare-sync.test.ts tests/unit/offline-demo-mode.test.ts tests/unit/http-refresh.test.ts tests/unit/notifications.store.test.ts`: PASS, 80 tests.
- `npm run build`: PASS.
- Real browser `http://127.0.0.1:4173/scheduling/dashboard` with stale `aimes_offline_demo=true` and a real token:
  - `/api/v1/dashboard`: requested.
  - `/hubs/monitoring/negotiate`: requested against `5003`.
  - no offline skip or dashboard failure.
- Real browser `http://127.0.0.1:4173/scheduling/monitoring` with stale `aimes_offline_demo=true` and a real token:
  - POC Hypercare and monitoring escalation APIs requested.
  - `/hubs/monitoring/negotiate`: requested against `5003`.
  - no offline skip, no initialization failure, no disconnected status.
