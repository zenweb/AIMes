# 2026-06-06 EmployeeBoard 员工弹窗语义 Plan

## Success Criteria

- 员工编辑/详情弹窗暴露 `role="dialog"`、`aria-modal="true"` 和稳定标题关联。
- 新增员工弹窗暴露同样语义。
- 关闭/取消按钮有场景化可访问名称。
- Unit 测试先失败后通过。
- 真实 Chromium e2e 能通过可访问角色和名称验证员工编辑弹窗。
- 真实 Chromium e2e 能通过鼠标点击员工卡片打开员工编辑弹窗。
- 真实 Chromium e2e 能验证 Escape 关闭编辑弹窗并回焦到原员工卡片。
- 真实 Chromium e2e 能验证新增员工弹窗打开后聚焦、Escape 关闭并回焦到 `+ 新增`。

## Scope

- 仅修改 `EmployeeBoard.vue`、`employee-board.test.ts`、`employee.spec.ts` 和本片文档。
- 不新增人员管理业务功能。
- 不处理 B 轨 hosted CI/staging/security/gray release 阻断项。

## Result

- 单测完成 RED/GREEN。
- Chromium 键盘路径通过。
- Chromium 鼠标路径先复现拦截失败，再完成布局修复并通过。
- Chromium 键盘路径追加验证 Escape 关闭和焦点回收。
- 新增员工弹窗追加 RED/GREEN 单测和 Chromium 证据：打开后焦点进入 dialog，Escape 关闭后回到新增按钮。
