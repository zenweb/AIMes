# 2026-06-06 InventoryBoard 库存操作弹窗真实浏览器证据

## Changed

- 为库存入库/出库/调拨/盘点操作弹窗补充 `role="dialog"`、`aria-modal="true"`、稳定标题关联和 Escape 关闭。
- 操作弹窗打开后焦点进入 dialog，关闭后回到原触发按钮。
- 修复库存页滚动布局，避免齐套面板把物料列表挤出视口并拦截鼠标点击。

## Tests

- RED：`npm.cmd run test:unit -- tests/unit/inventory-board.test.ts -t "focuses the stock operation dialog"`：预期失败，原弹窗缺少 `[role="dialog"]`。
- GREEN：同命令 1/5 passed，4 skipped。
- `npm.cmd run test:unit -- tests/unit/inventory-board.test.ts`：1 file passed，5/5 passed。
- RED：`npm.cmd run test:e2e -- tests/e2e/inventory.spec.ts -g "库存操作弹窗支持 Escape 关闭并回到入库按钮"`：真实 Chromium 失败，齐套面板拦截 `轴承钢圈` 物料点击。
- GREEN：同命令 Nuxt production build passed，Chromium 1/1 passed。

## Notes

- 本片只硬化既有库存管理关键路径，不新增库存业务功能。
- B 轨发布闸门仍未关闭：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度和 14 天 P0/P1=0 观察。
