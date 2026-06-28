# 2026-06-20 Plan: Live token offline demo recovery

## Goal

Make the employee live entry self-recover when a browser has stale offline-demo storage but a real backend login token exists.

## Steps

- [x] Reproduce and inspect current live-entry behavior.
- [x] Add a single shared decision rule for backend skipping.
- [x] Use that rule in HTTP API requests.
- [x] Use that rule in notification SignalR startup.
- [x] Cover live-token recovery and demo-token skip behavior with unit tests.
- [x] Rebuild frontend and verify the 4173 browser entry.

## Success Criteria

- A real backend token always attempts live employee API reads.
- Stale `aimes_offline_demo=true` alone cannot force employee fallback or shell offline status.
- Explicit demo URL intent and demo tokens still keep demo mode backend-skipping.
