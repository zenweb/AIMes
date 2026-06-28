# 2026-06-14 Review - Schedule Pareto Compare Missing Items List Fail-Loud

## 结论
- 通过。此片把多目标对比缺少顶层方案列表的 JS TypeError 改为业务可读 fail-loud。

## 审核点
- 正确性：`Array.isArray(result.items)` 在所有 `result.items.length` / `result.items.some` 访问前执行，避免未定义访问。
- 用户体验：错误文案指向后端合同缺失，不再暴露 `Cannot read properties of undefined`。
- 范围控制：仅修改 ParetoCompare 顶层结果合同校验，以及对应单元/e2e 测试。

## 证据
- 先红后绿：新增测试实现前捕获到 TypeError 文案，守卫加入后通过。
- 真实 Chromium：缺少方案列表场景展示 `role="alert"` 告警，并无推荐卡片/采用按钮。
- 全量 Scheduling Chromium：66 passed。
- 覆盖率：ParetoCompare 行覆盖 93.10%。

## 剩余风险
- 顶层 `items` 内部字段仍有更多数值合同可以继续精品化，但 `groupCount` 需要后端明确语义后再决定是否前端校验。
