# 2026-06-14 Issue - Schedule Pareto Compare KPI Ratio Out Of Range

## 问题
- 多目标对比中，后端可能返回 `utilizationRate: 1.2`，或其它超出 `0..1` 的比率指标。
- 修复前 UI 会继续展示推荐卡片、KPI 表和采用按钮，使异常指标看起来像可采纳方案。

## 影响
- 调度员会看到不可信的利用率、准交率或预计完成率。
- 推荐排序和采用入口可能基于异常 KPI 继续推进，影响排产决策可信度。

## 处理
- 在 ParetoCompare 加入 KPI 比率有效性校验。
- 任一比率不是有限数字或超出 `0..1` 时 fail-loud，并清空推荐状态。

## 状态
- 已修复并通过单元、真实 Chromium、全量 Scheduling Chromium 和覆盖率验证。
