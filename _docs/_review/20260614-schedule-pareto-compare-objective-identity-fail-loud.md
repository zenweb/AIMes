# 2026-06-14 Review - Schedule Pareto Compare Objective Identity Fail-Loud

## 结论
- 通过。此片修复多目标对比后端契约漏口：目标标识或目标名称缺失时，不再允许 UI 展示空徽标、空图例、空 tooltip、空 Tab 和采用入口。

## 审核点
- 正确性：`objective` 与 `objectiveLabel` 必须为非空字符串，避免推荐方案无法被调度员识别。
- 用户体验：错误以 `role="alert"` 出现在对比弹窗内，用户能明确知道是后端对比方案缺少目标标识或名称。
- 回归风险：变更仅限 ParetoCompare 后端返回契约校验，以及对应单元/e2e 测试。

## 证据
- 单元窄测先红后绿：修复前空目标名称会继续渲染推荐卡片和采用按钮；修复后触发 fail-loud。
- 真实 Chromium 窄测先红后绿：修复前找不到 `.error-msg[role="alert"]`；修复后展示告警并隐藏采用入口。
- 全量 ParetoCompare 单元：23 passed。
- 全量 Scheduling Chromium：69 passed。
- 覆盖率：ParetoCompare 行覆盖 93.35%。

## 剩余风险
- `groupCount` 暂不在前端盲校验，因为当前前端计划明细缺少可可靠推导批次/分组的字段。
- 后续可继续审计多个方案重复 `objective` 时是否会造成 Tab、推荐目标和甘特图数据覆盖。
