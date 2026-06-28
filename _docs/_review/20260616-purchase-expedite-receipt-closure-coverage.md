# 2026-06-16 Purchase Expedite Receipt Closure Coverage Review

## Decision

Accepted as a boutique hardening slice for an existing user-critical path.

## Why This Slice

- `PurchaseBoard.vue` was below the already-saturated components and had meaningful coverage leverage.
- The path protects a real manufacturing workflow: rush purchase receipt should release material shortage risk and allow scheduling review to continue.
- It avoids broadening scope and instead strengthens correctness evidence on an existing critical feature.

## Evidence

- Targeted suite passed: `tests/unit/purchase-board.test.ts`, `34 tests passed`.
- Targeted component coverage improved:
  - before: `PurchaseBoard.vue` lines `87.76%`;
  - after: `PurchaseBoard.vue` lines `91.04%`.
- Full frontend coverage passed: `111 files / 1036 tests passed`, all-file lines `92.07%`.

## Remaining Risk

- Strict v1.0.0 release readiness is still not claimed because gray observation remains owner-deferred.
- PurchaseBoard remaining uncovered lines are mostly partial receipt fallback predicates and refresh/list error tails; choose future slices by business value, not line chasing.
- Avoid running multiple Vitest coverage commands concurrently because they share `coverage/.tmp`.
