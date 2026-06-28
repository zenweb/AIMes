# 2026-06-14 Todo - Schedule Pareto Compare Work Order Count Fail-Loud Next Actions

## 下一步
- 继续沿着 ParetoCompare 精品化路线检查现有后端对比合同，不扩新功能。
- 优先审计 `groupCount` 与计划明细按设备/批次推导值是否存在不一致时仍展示推荐的问题。
- 检查 `estimatedCompletionRate`、`utilizationRate`、`onTimeDeliveryRate` 等摘要 KPI 是否已有可信来源或需要 fail-loud。

## 非阻断项
- 15 天灰度观察已按 owner 指令跳过/后置，不阻断当前排产多目标对比深度打磨。

## 停止条件
- 新增片必须同时具备单元测试、真实 Chromium 证据、全量相关回归和当天五类文档。
