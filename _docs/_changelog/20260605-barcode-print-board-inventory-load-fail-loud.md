# 2026-06-05 Barcode Print Board Inventory Load Fail Loud Changelog

## Change

- 选片依据：`BarcodePrintBoard.vue` 是条码/QR 打印和现场追溯入口，初始库存加载失败时静默回退不够精品。
- 新增红灯测试：库存列表接口失败时，页面必须以 assertive alert 暴露加载失败原因，同时继续展示 demo 标签和追溯桥接内容。
- 修复：新增 `loadError`，在 `getInventoryList()` 失败时保留 demo 库存数据，并将后端错误原因显示为 `标签列表加载失败：...`。

## Validation

- 红灯：`npm run test:unit -- tests/unit/barcode-print-board.test.ts` 先失败，旧实现无 `[role="alert"]`。
- 绿灯：`npm run test:unit -- tests/unit/barcode-print-board.test.ts`：4 tests passed。
- `npm run lint`：通过。

## Release Boundary

- 本片属于 A-track 条码打印入口可靠性证据。
- Hosted CI、staging rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察仍需 B-track 独立证据。
