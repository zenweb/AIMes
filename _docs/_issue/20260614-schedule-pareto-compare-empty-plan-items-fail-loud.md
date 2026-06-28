# 2026-06-14 Issue - 多目标对比计划明细为空但声明有工单

## 问题
- `ParetoCompare.vue` 旧逻辑只要求对比项有 `plan`，不检查 `plan.items` 与 `totalWorkOrders` 是否一致。
- 当后端返回 `totalWorkOrders: 1` 但 `plan.items: []` 时，页面仍会展示推荐卡、KPI 表和“采用”按钮。
- 这会让 KPI 声称可执行、甘特图却无任务明细的方案进入采用路径。

## 影响
- 用户关键路径：排产看板的多目标方案对比和推荐方案采用。
- 风险类型：假可落地方案、甘特图空载、采用后反馈链缺少任务级计划依据。
- 严重性：中高，属于现有排产功能必须补齐的可靠性和可审计性缺口。

## 修复
- 当任一 `item.totalWorkOrders > 0` 且 `item.plan.items.length === 0` 时抛出 `后端对比方案计划明细为空`。
- catch 分支沿用现有 fail-loud 告警，清空对比项、推荐目标和当前 tab。
- 单测和 Chromium e2e 均断言不展示推荐卡或“采用此方案”按钮。

## 验证
- 单测覆盖“有工单但计划明细为空”必须 fail-loud。
- Chromium 真实浏览器覆盖该矛盾载荷后弹窗展示失败告警。
- 完整排产 Chromium 套件和前端覆盖率总检均通过；套件中保留 1 个既有 flaky 的 retry 记录。
