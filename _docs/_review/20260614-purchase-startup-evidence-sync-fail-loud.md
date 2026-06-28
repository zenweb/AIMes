# 2026-06-14 Review - Purchase Startup Evidence Sync Fail-Loud

## Review Result
- Scope is limited to:
  - `src/frontend/src/components/purchase/PurchaseBoard.vue`
  - `src/frontend/tests/unit/purchase-board.test.ts`
  - `src/frontend/tests/e2e/purchase.spec.ts`
- The production change is localized to purchase-board startup evidence synchronization and notification preservation.
- The new unit test verifies the intent: every startup evidence sync failure remains visible instead of being overwritten by later failures.
- The new Chromium test verifies the same path in a real browser with localStorage failures plus backend evidence API failures.

## Verification
- `npm run test:unit -- tests/unit/purchase-board.test.ts`: 20 tests passed.
- `npm run test:unit:coverage -- tests/unit/purchase-board.test.ts`: `PurchaseBoard.vue` focused line coverage 77.67%.
- `npm run test:e2e -- tests/e2e/purchase.spec.ts -g "启动证据多源同步失败时真实浏览器保留全部 fail-loud 告警且采购列表可用"`: Chromium 1 passed.
- `npm run test:e2e -- tests/e2e/purchase.spec.ts`: Chromium 11 passed.
- `npm run test:unit:coverage`: 105 files / 680 tests passed, global lines 82.92%, `PurchaseBoard.vue` full-run lines 77.74%.

## Residual Risk
- This slice does not change backend evidence persistence semantics.
- Remaining purchase-board coverage should target distinct user-critical behavior, not repeat the now-covered startup multi-source sync failure path.
- Gray observation / 15-day monitoring is deferred by owner instruction.
