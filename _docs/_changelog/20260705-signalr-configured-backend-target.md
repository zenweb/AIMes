# 2026-07-05 Changelog: SignalR Configured Backend Target

## Changed

- Fixed `resolveSignalRHubUrl()` so standalone preview builds use `VITE_API_TARGET` for SignalR hubs instead of hardcoding `5003`.
- Added unit coverage for configured backend targets and no-target same-origin fallback.
- Updated Monitoring SignalR next actions with the completed configured-target browser evidence.
- Added `_docs/_review/20260705-signalr-configured-backend-target.md`.
- Added `_docs/_reports/signalr-configured-backend-target-20260705.png`.

## Verification

- `npm run test:unit -- tests/unit/signalr-url.test.ts tests/unit/dashboard-board.test.ts tests/unit/monitoring-board.test.ts tests/unit/notifications.store.test.ts`
  - `4 passed (4)`, `40 passed (40)`
- `npm run lint -- src/utils/signalr-url.ts tests/unit/signalr-url.test.ts tests/unit/dashboard-board.test.ts tests/unit/monitoring-board.test.ts tests/unit/notifications.store.test.ts`
  - PASS
- `VITE_API_TARGET=http://127.0.0.1:5002 npm run build`
  - PASS
- Real browser login through `http://127.0.0.1:4173/scheduling/login`
  - SignalR negotiate requests went to `http://127.0.0.1:5002/hubs/...`
  - Browser console reported `0` errors and `0` warnings
