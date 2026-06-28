# 2026-06-14 Review - Schedule Pareto Compare Changeover Minutes Fail-Loud

## 结论
- 通过。此片修复多目标对比后端契约漏口：换型分钟为负数或非有限数字时，不再允许 UI 展示推荐方案、雷达图、KPI 表和采用入口。

## 审核点
- 正确性：`totalChangeoverMinutes` 必须是有限数字且不小于 0，避免 `-5 分钟` 被当成低换线优势进入推荐理由和图表。
- 用户体验：错误以 `role="alert"` 出现在对比弹窗内，用户能明确知道是后端对比方案换型分钟无效。
- 回归风险：变更仅限 ParetoCompare 后端返回契约校验，以及对应单元/e2e 测试。

## 证据
- 单元窄测先红后绿：修复前负数换型分钟会继续渲染推荐卡片；修复后触发 fail-loud。
- 真实 Chromium 窄测先红后绿：修复前找不到 `.error-msg[role="alert"]`；修复后展示告警并隐藏采用入口。
- 全量 ParetoCompare 单元：22 passed。
- 全量 Scheduling Chromium：68 passed。
- 覆盖率：ParetoCompare 行覆盖 93.28%。

## 剩余风险
- 仍可继续审计 `objective`、`objectiveLabel` 为空时是否会造成空 Tab、空徽标或错误推荐文案。
- `groupCount` 暂不在前端盲校验，因为当前前端计划明细缺少可可靠推导批次/分组的字段。
