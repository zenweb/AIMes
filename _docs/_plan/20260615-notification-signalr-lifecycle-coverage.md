# 2026-06-15 Notification SignalR Lifecycle Coverage Plan

## Objective

Improve evidence for a shared operator-facing notification path without broadening product scope.

## Selection Rationale

After auth/router and HTTP client evidence, the notification store was the next shared low-coverage path. It is user-critical because API failures, production events, quality alerts, and SignalR lifecycle state all surface through it.

## Execution

1. Read `src/stores/notifications.ts` and existing notification tests.
2. Add focused tests for duplicate connection prevention and offline demo bypass.
3. Add focused tests for ordinary business event toast mapping.
4. Add a fallback-label test for unknown backend values.
5. Run focused tests, focused coverage, and notification/http regression.
6. Record evidence in five documentation streams.

## Result

No implementation change was needed. The added tests proved the existing notification lifecycle and mapping behavior.

