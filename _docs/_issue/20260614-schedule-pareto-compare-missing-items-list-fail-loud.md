# 2026-06-14 Issue - Schedule Pareto Compare Missing Items List

## 问题
- 后端对比接口若返回 200 但缺少顶层 `items`，前端会访问 `result.items.length` 并展示 JS TypeError。

## 影响
- 调度员看到 `Cannot read properties of undefined`，无法判断是后端对比合同缺失。
- 错误虽能阻止推荐渲染，但不是精品级业务体验。

## 处理
- 在 `result.items.length` 前增加 `Array.isArray(result.items)` 守卫。
- 缺少方案列表时抛出 `后端对比结果缺少方案列表`。

## 状态
- 已修复并通过单元、真实 Chromium、全量 Scheduling Chromium 和覆盖率验证。
