# 2026-06-14 Issue - Schedule Pareto Compare Negative Changeover Minutes

## 问题
- 多目标对比中，后端可能返回 `totalChangeoverMinutes: -5`。
- 修复前 UI 会继续展示推荐卡片、雷达图、KPI 表和采用按钮，并把 `-5 分钟` 当成推荐理由的一部分。

## 影响
- 调度员会看到不可信的换型时间 KPI。
- 推荐排序、低换线雷达图和采用入口可能基于异常 KPI 继续推进，影响排产决策可信度。

## 处理
- 在 ParetoCompare 加入换型分钟有效性校验。
- 换型分钟不是有限数字或小于 0 时 fail-loud，并清空推荐状态。

## 状态
- 已修复并通过单元、真实 Chromium、全量 Scheduling Chromium 和覆盖率验证。
