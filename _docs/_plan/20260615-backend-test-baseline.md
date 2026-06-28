# 2026-06-15 Backend Test Baseline Plan

## Goal

Establish the Sprint 0 backend green/red baseline for the CC remediation plan before continuing deeper feature hardening.

## Scope

1. Run architecture tests.
2. Run unit tests sequentially if shared build output contention appears.
3. Run integration tests sequentially.
4. Run evaluation tests sequentially.
5. Record skipped/non-gate items explicitly.

## Current Result

- Architecture: green, 115/115.
- Unit: green, 444/444 with `-m:1`.
- Integration: green, 203/203 with `-m:1`.
- Evaluation: green, 2/2 with `-m:1`.
- Benchmarks: not run as a regular release baseline gate.
- Docker smoke: deferred to a runtime slice; compose config currently resolves API to `5002`.

## Next Routing

Continue with existing user-critical feature depth. Prefer low-coverage or weak-evidence critical paths over adding new scope.

