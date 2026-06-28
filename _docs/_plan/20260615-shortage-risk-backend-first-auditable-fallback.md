# 2026-06-15 Shortage Risk Backend-First Auditable Fallback Plan

## Objective

Harden the shortage / supply / supplier-network evidence readers so incomplete backend latest records do not override local audited evidence.

## Execution

1. Inspect the shortage evidence sync utility and its current tests.
2. Add a test that proves incomplete backend payloads must fall back to local audited state.
3. Implement the smallest change in backend-first readers.
4. Verify the targeted slice, related slices, and full frontend unit suite.

## Result

The backend-first readers now validate backend payload shape before returning it.

## Next Best Step

Continue toward other low-coverage user-critical paths only if they still have an evidence-backed gap. Otherwise preserve the current baseline and stop widening scope.
