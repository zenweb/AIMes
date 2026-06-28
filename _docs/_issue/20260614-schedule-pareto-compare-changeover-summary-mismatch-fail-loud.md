# 2026-06-14 Issue - 多目标对比换型分钟摘要不一致

## 问题
- `ParetoCompare.vue` 旧逻辑没有校验顶层 `totalChangeoverMinutes` 与 `plan.totalChangeoverMinutes` 是否一致。
- 当后端返回 `totalChangeoverMinutes: 28` 但 `plan.totalChangeoverMinutes: 60` 时，页面会继续渲染推荐方案、KPI 表、图表和采用入口。
- 同一个方案的换型分钟在对比指标和计划摘要里不一致，会污染推荐依据。

## 影响
- 用户关键路径：排产看板的多目标方案对比和推荐方案采用。
- 风险类型：冲突 KPI 展示、推荐依据污染、采纳动作缺少可信指标基础。
- 严重性：中，属于现有排产功能必须补齐的可靠性缺口。

## 修复
- 新增 `hasChangeoverMinutesMismatch`，在 `plan.totalChangeoverMinutes` 存在时要求它与顶层 `totalChangeoverMinutes` 完全一致。
- 当任一对比项换型分钟与计划摘要不一致时抛出 `后端对比方案换型分钟与计划摘要不一致`。
- 单测和 Chromium e2e 均断言不展示推荐卡或“采用此方案”入口。

## 验证
- 单测覆盖换型分钟与计划摘要不一致时必须 fail-loud。
- Chromium 真实浏览器覆盖冲突摘要后弹窗展示失败告警。
- 完整排产 Chromium 套件和前端覆盖率总检均通过。
