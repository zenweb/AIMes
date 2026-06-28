# 2026-06-14 Todo - Schedule Pareto Compare Missing Items List Fail-Loud Next Actions

## 下一步
- 继续 ParetoCompare 现有功能深度打磨，不扩新功能。
- 优先检查顶层 `items` 内每个方案的数值 KPI 是否存在 `NaN`、负数、超过 1 的比例值等可明确 fail-loud 的合同缺口。
- `groupCount` 暂不前端推导；需要后端明确它是否等同于 `ScheduleAssignmentData.GroupId` 的 distinct count，且是否应映射到前端计划明细。

## 非阻断项
- 15 天灰度观察已按 owner 指令跳过/后置，不阻断当前工作。

## 停止条件
- 每个新片都必须具备 RED/GREEN、真实 Chromium 证据、全量相关回归、覆盖率和五类文档。
