# 2026-06-06 InventoryBoard 库存操作弹窗 Issue

## 已处理

- 库存操作弹窗原本没有 modal dialog 语义，屏幕阅读器无法通过角色和标题稳定识别。
- 弹窗打开后不会接收焦点，Escape 关闭和关闭回焦缺少证据。
- 真实 Chromium 发现齐套面板会把物料列表挤出可点击视口并拦截鼠标事件。

## 修复

- 操作弹窗补充 `role="dialog"`、`aria-modal="true"`、`aria-labelledby`、`tabindex="-1"` 和 Escape 关闭。
- 打开弹窗后聚焦到 dialog；关闭后回焦到触发按钮。
- 库存页改为页面级滚动，`board-body` 不再强行吃满剩余高度。

## 发布闸门

- 本 issue 只覆盖 A 轨质量打磨，不关闭 B 轨发布阻断项。
