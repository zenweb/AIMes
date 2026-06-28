# 2026-06-14 Issue - Schedule Pareto Compare Work Order Count Mismatch

## 问题
- 多目标对比中，后端可能返回 `totalWorkOrders: 2`，但 `plan.items.length` 只有 1。
- 修复前 UI 会继续展示推荐卡片、KPI 表中的工单数 2，以及采用按钮。

## 影响
- 调度员会看到与甘特明细不一致的工单数 KPI。
- 推荐理由和采用入口可能基于不完整计划明细继续推进，影响排产决策可信度。

## 处理
- 在 ParetoCompare 加入工单数与计划明细数量一致性校验。
- 不一致时 fail-loud，并清空推荐状态。

## 状态
- 已修复并通过单元、真实 Chromium、全量 Scheduling Chromium 和覆盖率验证。
