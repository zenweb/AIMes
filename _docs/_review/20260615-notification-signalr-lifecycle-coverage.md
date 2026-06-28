# 2026-06-15 Review: Notification SignalR Lifecycle Coverage

## Result

PASS.

This slice strengthens evidence around the global notification surface that carries operator-facing errors, warnings, and production events.

## Why This Slice

The latest coverage summary showed `src/stores/notifications.ts` as a lower-covered shared UX path:

- previous summary: 84.14% lines, 52.27% branches.

After the HTTP client slice, notification lifecycle and event mapping was the next shared path where regressions would affect multiple modules.

## Verified Contract

- Repeated `connect()` calls do not start duplicate SignalR sessions when already connected.
- Offline demo mode bypasses SignalR build/start and leaves connection state false.
- Equipment, production, inventory, and purchase events create the expected operator toasts.
- Unknown backend status and severity values remain visible rather than rendering blank labels.

## Evidence

- `npm run test:unit -- tests/unit/notifications.store.test.ts --reporter=dot`: 12 passed.
- `npm run test:unit:coverage -- tests/unit/notifications.store.test.ts --reporter=dot --coverage.reporter=json-summary`:
  - `src/stores/notifications.ts`: 92.68% lines, 91.76% statements, 70.45% branches, 81.81% functions.
- `npm run test:unit -- tests/unit/notifications.store.test.ts tests/unit/http-refresh.test.ts --reporter=dot`: 22 passed.

## Boundary

This is a frontend notification evidence slice. It does not prove live SignalR connectivity against a running backend, hosted CI, staging, gray observation, or full v1.0.0 release readiness.

