# 2026-06-14 Todo - Schedule Pareto Compare Objective Identity Fail-Loud Next Actions

## 下一步
- 继续沿着 ParetoCompare 精品化路线检查现有后端对比合同，不扩新功能。
- 优先审计多个方案重复 `objective` 时是否会覆盖 `ganttDataByObjective`，导致 Tab 与甘特图明细错配。
- 继续保持每片都有单元测试、真实 Chromium 证据、全量相关回归和当天五类文档。

## 非阻断项
- 15 天灰度观察已按 owner 指令跳过/后置，不阻断当前排产多目标对比深度打磨。
- `groupCount` 前端暂不盲校验；后端有 `GroupCount`，但当前前端 `plan.items` 未携带可推导分组的稳定字段。

## 停止条件
- 新增片必须先红后绿，并且不能让推荐卡片或采用按钮在异常合同下渲染。
