# 2026-06-14 Purchase Startup Evidence Sync Fail-Loud

## Change
- Hardened `PurchaseBoard.vue` startup behavior when multiple evidence sources fail during initial sync.
- Moved local supplier network, outsourcing commitment, and anomaly dispatch evidence reads out of setup-time initialization and into mounted startup recovery.
- Added accumulated startup failure notices so later sync failures do not overwrite earlier fail-loud alerts.
- Preserved board usability: purchase list still loads even when local evidence reads and backend evidence APIs fail.

## Evidence
- `npm run test:unit -- tests/unit/purchase-board.test.ts`
  - 1 file passed.
  - 20 tests passed.
- `npm run test:unit:coverage -- tests/unit/purchase-board.test.ts`
  - `PurchaseBoard.vue`: focused lines 77.67%.
- `npm run test:e2e -- tests/e2e/purchase.spec.ts -g "启动证据多源同步失败时真实浏览器保留全部 fail-loud 告警且采购列表可用"`
  - Chromium: 1 test passed.
- `npm run test:e2e -- tests/e2e/purchase.spec.ts`
  - Chromium: 11 tests passed.
- `npm run test:unit:coverage`
  - 105 files passed.
  - 680 tests passed.
  - global lines 82.92%.
  - `PurchaseBoard.vue`: full-run lines 77.74%.

## Notes
- This slice moved `PurchaseBoard.vue` full-run line coverage to 77.74%.
- The fix is reliability and observability hardening for an existing user-critical purchase workflow; no new product scope was added.
- Gray observation / 15-day monitoring is skipped/deferred by owner direction and is not counted as a current blocker.
