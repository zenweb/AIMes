# 2026-06-06 EmployeeBoard 员工弹窗语义 Review

## Findings

- 未发现本片新增代码问题。
- 真实浏览器暴露的鼠标点击拦截问题已在本片补修：`EmployeeBoard` 改为页面级滚动容器，员工列表不再被压成 0 高。

## 审核结论

- 变更范围收敛在 `EmployeeBoard` 编辑/详情与新增员工弹窗、对应 unit/e2e 测试。
- 未改变员工创建、更新、离职 API 调用和本地列表更新逻辑。
- RED/GREEN 单测验证编辑与新增弹窗都具备 modal dialog 语义。
- 真实 Chromium 场景验证键盘用户可从员工卡片打开命名编辑对话框，并通过 `关闭员工编辑` 关闭。
- 真实 Chromium 场景验证鼠标用户也可点击 `EMP-001` 员工卡片打开命名编辑对话框。
- 真实 Chromium 场景验证键盘用户按 Escape 可关闭编辑弹窗，焦点回到原员工卡片。
- 真实 Chromium 场景验证键盘用户可打开 `新增员工` 弹窗，焦点进入 dialog，按 Escape 关闭后回到 `+ 新增`。
- 最新 `employee-board.test.ts` 11/11 passed；`npm.cmd run lint` passed。

## 剩余风险

- 本片没有证明发布级 B 轨闸门完成。
- 本片未实现完整焦点陷阱；当前只验证打开聚焦、Escape 关闭和关闭回焦。
