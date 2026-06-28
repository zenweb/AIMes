# 2026-06-14 Review - Schedule Pareto Compare KPI Ratio Fail-Loud

## 结论
- 通过。此片修复多目标对比后端契约漏口：KPI 比率超出有效范围时，不再允许 UI 展示推荐方案、KPI 和采用入口。

## 审核点
- 正确性：`utilizationRate`、`onTimeDeliveryRate`、`estimatedCompletionRate` 必须是有限数字且位于 `0..1`，避免把 120% 这类异常比率当成可比较方案展示。
- 用户体验：错误以 `role="alert"` 出现在对比弹窗内，用户能明确知道是后端对比方案指标超出有效范围。
- 回归风险：变更仅限 ParetoCompare 后端返回契约校验，以及对应单元/e2e 测试。

## 证据
- 单元窄测：新增 `KPI rates` 场景通过，确认异常指标触发 fail-loud，并且不触发推荐和采用。
- 真实 Chromium 窄测：新增「指标超出有效范围」场景通过，确认浏览器内展示告警并隐藏推荐入口。
- 全量 ParetoCompare 单元：21 passed。
- 全量 Scheduling Chromium：67 passed。
- 覆盖率：ParetoCompare 行覆盖 93.20%。

## 剩余风险
- 仍可继续审计 `totalChangeoverMinutes`、`objective`、`objectiveLabel` 等展示/评分字段是否存在类似异常合同漏口。
- `groupCount` 暂不在前端盲校验，因为当前前端计划明细缺少可可靠推导批次/分组的字段。
