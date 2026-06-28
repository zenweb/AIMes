# 2026-06-14 Issue - OTD Evidence API Contract Evidence

## Issue
OTD evidence API helpers are a shared backend entry point for many cross-module evidence producers, but direct endpoint and parameter coverage was missing.

## Impact
- Path or `take` parameter drift could break shared OTD evidence replay across Dashboard, Chat, Admin, Report, and Audit flows.
- Swallowing API read failures at the helper layer would blur responsibility between API contracts and local fallback logic.

## Resolution
- Added `otd-evidence-api.test.ts` to cover read/write contracts and read failure propagation.

## Status
- Closed for unit-level contract evidence.
- Live OTD write/read/replay evidence remains separate work.
