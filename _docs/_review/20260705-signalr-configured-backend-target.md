# 2026-07-05 Review: SignalR Configured Backend Target

## Scope

- Slice: frontend SignalR hub URL resolution for notifications and monitoring.
- Trigger: real browser evidence from anomaly-dispatch live readback showed SignalR negotiate requests still targeting `http://127.0.0.1:5003/hubs/...` while the live backend was reachable at host port `5002`.
- Constraint: do not use backend port `5000`.

## Root Cause

`src/frontend/src/utils/signalr-url.ts` special-cased standalone preview port `4173` and hardcoded `:5003`.

That bypassed the configured backend target used by the rest of the frontend API stack. REST calls continued to work through `/api`, but SignalR ignored `VITE_API_TARGET=http://127.0.0.1:5002` and tried the default `5003` host port.

## Change

- `resolveSignalRHubUrl()` now uses `import.meta.env.VITE_API_TARGET` when present.
- If no configured backend target exists, it falls back to the same-origin hub path.
- Added unit coverage for configured target and no-target fallback.

## Verification

Focused unit tests:

```text
npm run test:unit -- tests/unit/signalr-url.test.ts tests/unit/dashboard-board.test.ts tests/unit/monitoring-board.test.ts tests/unit/notifications.store.test.ts
Test Files  4 passed (4)
Tests  40 passed (40)
```

Focused lint:

```text
npm run lint -- src/utils/signalr-url.ts tests/unit/signalr-url.test.ts tests/unit/dashboard-board.test.ts tests/unit/monitoring-board.test.ts tests/unit/notifications.store.test.ts
PASS
```

Build and real browser evidence:

```text
VITE_API_TARGET=http://127.0.0.1:5002 npm run build
http://127.0.0.1:4173/scheduling/login
admin/admin123
```

Observed browser requests after login:

```text
POST http://127.0.0.1:5002/hubs/notifications/negotiate?negotiateVersion=1 => 200 OK
POST http://127.0.0.1:5002/hubs/monitoring/negotiate?negotiateVersion=1 => 200 OK
```

Observed browser console:

```text
Total messages: 0 (Errors: 0, Warnings: 0)
```

Screenshot:

```text
_docs/_reports/signalr-configured-backend-target-20260705.png
```

## Verdict

PASS. The live browser no longer hardcodes `5003` for SignalR when a configured backend target points to `5002`.
