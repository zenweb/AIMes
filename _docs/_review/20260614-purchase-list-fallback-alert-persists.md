# Review - Purchase list fallback alert persists

## Scope
- Reviewed `src/frontend/src/components/purchase/PurchaseBoard.vue`.
- Reviewed `src/frontend/tests/unit/purchase-board.test.ts`.
- Reviewed `src/frontend/tests/e2e/purchase.spec.ts`.

## Findings
- No open issue found in this slice after verification.
- The behavior gap was confirmed by RED first: a successful order confirmation cleared the unresolved initial list fallback alert.

## Decision
- Moved only the initial list-load fallback alert to `appendStartupSyncFailure(...)`.
- Kept operation alerts unchanged so stale submit/confirm/receive errors can still be cleared by later operation attempts.

## Residual Risk
- Coverage still reports the existing `--localstorage-file` warning; tracked as separate cleanup, not part of this feature slice.
