# 2026-06-15 Notification SignalR Lifecycle Coverage Issue

## Issue

The global notification store had relatively weak branch coverage despite owning operator-facing SignalR lifecycle state and event-to-toast mapping.

## Risk

Without focused evidence, regressions could:

- start duplicate SignalR connections;
- attempt live SignalR in offline demo mode;
- drop ordinary production, inventory, purchase, or equipment events;
- hide unknown backend status/severity values instead of surfacing them to operators.

## Resolution

Added focused tests to `src/frontend/tests/unit/notifications.store.test.ts`.

## Evidence

- `notifications.store.test.ts`: 12 passed.
- Focused `src/stores/notifications.ts` coverage: 92.68% lines, 70.45% branches.
- Notification + HTTP focused regression: 22 passed.

