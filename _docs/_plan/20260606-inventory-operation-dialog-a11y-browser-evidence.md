# 2026-06-06 InventoryBoard 库存操作弹窗 Plan

## Success Criteria

- 库存操作弹窗暴露稳定 modal dialog 语义。
- 弹窗打开后焦点进入 dialog。
- Escape 关闭弹窗后焦点回到触发按钮。
- 真实 Chromium 能验证物料可点击、`入库` dialog 可打开并可关闭回焦。

## Scope

- 仅修改 `InventoryBoard.vue`、`inventory-board.test.ts`、`inventory.spec.ts` 和本片文档。
- 不新增库存业务功能。
- 不处理 B 轨 hosted CI/staging/security/gray release 阻断项。

## Result

- Unit 完成 RED/GREEN。
- Chromium 先复现齐套面板拦截点击，再完成布局修复并通过目标用例。
