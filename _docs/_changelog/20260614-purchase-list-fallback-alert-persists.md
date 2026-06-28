# 20260614 Purchase list fallback alert persists

## Change
- Fixed `PurchaseBoard` initial purchase list fallback warning so it is stored in the startup fail-loud lane.
- A later successful purchase confirmation no longer clears the unresolved "采购订单列表加载失败" warning.

## Evidence
- `npm run test:unit -- tests/unit/purchase-board.test.ts -t "keeps the initial purchase list fallback warning visible"`: 1 passed.
- `npm run test:unit -- tests/unit/purchase-board.test.ts`: 24 passed.
- `npm run test:e2e -- tests/e2e/purchase.spec.ts -g "列表首次降级后确认采购订单成功仍保留列表告警" --project=chromium`: 1 passed.
- `npm run test:e2e -- tests/e2e/purchase.spec.ts --project=chromium`: 13 passed.
- `npm run test:unit:coverage`: 105 files / 777 tests passed; global line coverage 84.19%; `PurchaseBoard.vue` line coverage 78.5%.

## Fail Loud
- Known warning remains during coverage: `--localstorage-file was provided without a valid path`.
