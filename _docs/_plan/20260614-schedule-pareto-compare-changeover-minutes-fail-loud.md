# 2026-06-14 Plan - Schedule Pareto Compare Changeover Minutes Fail-Loud

## 目标
- 防止多目标对比在后端返回异常换型分钟时继续展示推荐和采用入口。

## 范围
- 仅修改 ParetoCompare 后端对比结果校验。
- 仅新增对应单元测试和真实 Chromium e2e 测试。
- 不新增排产功能，不改变灰度观察策略。

## 执行步骤
- 新增单元测试和 Chromium e2e，覆盖 `totalChangeoverMinutes: -5` 的异常合同。
- 确认测试先红：修复前 UI 会展示推荐卡片、图表和采用入口。
- 加入最小校验：`totalChangeoverMinutes` 必须是有限数字且不小于 0。
- 跑窄测、全量相关测试、覆盖率和收尾检查。

## 完成标准
- 异常合同展示 `role="alert"` 告警。
- 推荐卡片和采用按钮不渲染。
- ParetoCompare 单元全绿，Scheduling Chromium 全绿，覆盖率通过。
