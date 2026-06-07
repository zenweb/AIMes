# 2026-06-05 Barcode Print Board Inventory Retry

## 已完成
- 在 `BarcodePrintBoard.vue` 中补上库存列表加载失败后的重试加载按钮，失败后不再只停留在静态告警。
- 重试成功后会恢复真实库存列表并清空 `loadError`，把用户从 demo 兜底状态带回后端数据。

## 验证
- `npm run test:unit -- tests/unit/barcode-print-board.test.ts`：通过，5/5。
- `npm run test:unit:coverage`：通过，498/498。
- `npm run lint`：通过。
