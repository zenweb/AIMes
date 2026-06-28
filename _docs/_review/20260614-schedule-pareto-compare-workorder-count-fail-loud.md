# 2026-06-14 Review - Schedule Pareto Compare Work Order Count Fail-Loud

## 结论
- 通过。此片修复多目标对比后端契约漏口：声明工单数和计划明细数量不一致时，不再允许 UI 展示推荐方案、KPI 和采用入口。

## 审核点
- 正确性：`totalWorkOrders !== plan.items.length` 会在进入时间窗、依赖、同设备冲突等深层校验前 fail-loud，避免 KPI 表展示虚假工单数。
- 用户体验：错误以 `role="alert"` 出现在对比弹窗内，用户能明确知道是后端对比方案数据不一致。
- 回归风险：变更仅限 ParetoCompare 后端返回契约校验，以及对应单元/e2e 测试。

## 证据
- 单元窄测先红后绿：新增场景在实现前会继续显示推荐卡片；实现后展示 fail-loud 告警。
- 真实 Chromium 窄测先红后绿：新增场景在实现前找不到 `.error-msg[role="alert"]`；实现后通过。
- 全量 Scheduling Chromium：65 passed。
- 覆盖率：ParetoCompare 行覆盖 93.05%。

## 剩余风险
- 仍可继续审计其它 KPI 字段和计划摘要字段是否存在类似「声明值与明细推导值不一致」的后端契约缺口。
