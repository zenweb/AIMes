# 2026-06-14 Issue - Shortage Evidence API Contract Evidence

## Issue
Shortage evidence API helpers drive a user-critical Inventory -> Purchase -> Schedule/Dashboard recovery loop, but direct endpoint contract coverage was weak.

## Impact
- Endpoint drift could silently break shortage recovery evidence.
- Backend outages could be misinterpreted unless optional latest-read fallback behavior remained explicit and tested.

## Resolution
- Added `shortage-evidence-api.test.ts` to cover backend paths, payload forwarding, and `null` fallback behavior for optional latest reads.

## Status
- Closed for unit-level contract evidence.
- Live end-to-end shortage read/write evidence remains separate work.
