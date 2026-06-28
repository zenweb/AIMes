# 2026-06-14 Plan - 多目标推荐分数后端契约

## 成功标准
- 后端批量优化响应中的每个对比方案都包含 0-1 范围内的推荐分数。
- 前端推荐卡展示后端分数，而不是复算真实响应分数。
- 缺少推荐分数时前端 fail-loud，不渲染采纳入口。
- 单测、后端集成测试、真实 Chromium 定向路径通过。

## 执行
- 为后端集成测试补 `RecommendationScore` 响应断言。
- 为前端补“缺少推荐分数” fail-loud 单测。
- 在后端 DTO 和应用服务中返回 `RecommendationScore`。
- 在前端 API 类型和 `ParetoCompare` 中消费 `recommendationScore`。
- 保留 demo fallback 本地计算，限定在离线演示数据。

## 停止条件
- 定向验证和审计通过后停止，不扩大到新功能。
