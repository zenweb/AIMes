# 2026-06-14 Plan - Schedule Pareto Compare Work Order Count Fail-Loud

## 目标
- 防止多目标对比在后端声明工单数与计划明细数量不一致时继续展示推荐和采用入口。

## 范围
- 仅修改 ParetoCompare 后端对比结果校验。
- 仅新增对应单元测试和真实 Chromium e2e 测试。
- 不新增排产功能，不改变灰度观察策略。

## 执行步骤
- 先新增单元测试和 Chromium e2e，确认当前实现会漏掉该异常合同。
- 加入最小校验：`totalWorkOrders !== plan.items.length` 时抛出 `后端对比方案工单数与计划明细不一致`。
- 跑窄测、全量相关测试、覆盖率和收尾检查。

## 完成标准
- 异常合同展示 `role="alert"` 告警。
- 推荐卡片和采用按钮不渲染。
- ParetoCompare 单元全绿，Scheduling Chromium 全绿，覆盖率通过。
