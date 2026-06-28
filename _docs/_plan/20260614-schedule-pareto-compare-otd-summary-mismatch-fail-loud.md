# 2026-06-14 Plan - 多目标对比准时率摘要不一致 Fail-Loud

## 目标
- 让 `ParetoCompare` 在后端返回的顶层准时率与计划摘要准时率不一致时 fail-loud。
- 阻止推荐卡、图表和采纳入口基于冲突 KPI 继续展示。

## 成功标准
- 单测覆盖 `onTimeDeliveryRate: 0.93` 与 `plan.onTimeDeliveryRate: 0.74` 的失败路径。
- Chromium 真实浏览器覆盖同一冲突载荷。
- 失败时出现 `后端对比方案准时率与计划摘要不一致`。
- 失败时不展示 `.recommend-card`，也不展示“采用此方案”按钮。
- 完整 `pareto-compare.test.ts`、完整 `scheduling.spec.ts --project=chromium` 和 `test:unit:coverage` 有新鲜结果。

## 执行
1. 先写单测和 Chromium e2e，确认旧逻辑红测失败。
2. 在 `ParetoCompare.vue` 增加最小一致性校验。
3. 跑窄域绿测、完整组件单测、完整真实浏览器套件和覆盖率。
4. 补充 changelog/review/todo/issue/plan。
5. 执行 diff、敏感信息和关键文本审计。

## 非目标
- 不新增多目标对比的新业务能力。
- 不处理 15 天灰度观察；该项已跳过/延期。
- 不修复其他模块的覆盖率或历史工作树改动。
