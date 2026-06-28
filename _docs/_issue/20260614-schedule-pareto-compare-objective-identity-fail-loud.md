# 2026-06-14 Issue - Schedule Pareto Compare Missing Objective Identity

## 问题
- 多目标对比中，后端可能返回空 `objectiveLabel`，或缺少可识别的 `objective`。
- 修复前 UI 会继续展示推荐卡片、雷达图、KPI 表、Tab 和采用按钮。

## 影响
- 调度员会看到空徽标、空图例、空 tooltip 和空 Tab。
- 推荐方案虽然可被采用，但用户无法可靠识别采用的是哪个优化目标，影响排产决策可解释性。

## 处理
- 在 ParetoCompare 加入目标身份校验。
- `objective` 或 `objectiveLabel` 为空时 fail-loud，并清空推荐状态。

## 状态
- 已修复并通过单元、真实 Chromium、全量 Scheduling Chromium 和覆盖率验证。
