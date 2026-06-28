# 2026-06-14 Plan - Schedule Pareto Compare KPI Ratio Fail-Loud

## 目标
- 防止多目标对比在后端返回异常 KPI 比率时继续展示推荐和采用入口。

## 范围
- 仅修改 ParetoCompare 后端对比结果校验。
- 仅新增对应单元测试和真实 Chromium e2e 测试。
- 不新增排产功能，不改变灰度观察策略。

## 执行步骤
- 新增单元测试和 Chromium e2e，覆盖 `utilizationRate: 1.2` 的异常合同。
- 加入最小校验：`utilizationRate`、`onTimeDeliveryRate`、`estimatedCompletionRate` 必须是有限数字且位于 `0..1`。
- 跑窄测、全量相关测试、覆盖率和收尾检查。

## 完成标准
- 异常合同展示 `role="alert"` 告警。
- 推荐卡片和采用按钮不渲染。
- ParetoCompare 单元全绿，Scheduling Chromium 全绿，覆盖率通过。
