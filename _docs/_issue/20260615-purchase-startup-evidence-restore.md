# 2026-06-15 Issue: Purchase startup evidence restore

## Problem
- `PurchaseBoard` restored backend supply risk, supplier network, and outsourcing evidence during startup, but the combined positive restore path was not locked by a focused test.

## Impact
- A regression could re-enable duplicate procurement actions or rewrite already-restored audit evidence after page reload.

## Resolution
- Added a focused test that injects backend-first restored records for all three evidence surfaces.
- Verified visible restored state, disabled duplicate actions, and absence of duplicate audit writes.
