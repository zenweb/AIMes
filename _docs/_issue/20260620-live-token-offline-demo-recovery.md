# 2026-06-20 Issue: Live token blocked by stale offline demo storage

## Symptom

The employee page could show local sample data or shell `离线` even when the backend and login were healthy.

## Root Cause

`isOfflineDemoMode()` treated persisted `aimes_offline_demo=true` as a hard backend skip. After a successful backend login, any stale storage left behind by an earlier demo session could still short-circuit API calls and SignalR startup.

## Resolution

Introduce token-aware backend skipping:

- Explicit `offlineDemo=1` / `demoMode=true`: skip backend.
- Demo token or missing token while demo mode is active: skip backend.
- Real backend token: do not skip backend because of stale demo storage.

## Status

Resolved for HTTP API reads and notification SignalR startup.
