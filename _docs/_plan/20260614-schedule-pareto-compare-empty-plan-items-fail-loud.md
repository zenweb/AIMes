# 2026-06-14 Plan - 多目标对比计划明细为空 Fail-Loud

## 成功标准
- 当对比项声明有工单但 `plan.items` 为空时，页面必须展示可访问失败提示。
- 不得展示推荐方案卡片或“采用此方案”按钮。
- 相关单测、真实浏览器用例、覆盖率总检必须通过。

## 执行
- 在 `pareto-compare.test.ts` 增加 `totalWorkOrders > 0` 且 `plan.items: []` 的 RED 用例。
- 在 `ParetoCompare.vue` 中校验计划摘要和明细一致。
- 在 `scheduling.spec.ts` 增加 Chromium 用例，模拟 KPI 有工单但计划明细为空。
- 跑完整相关验证并记录覆盖率与 flaky。

## 验证命令
- `npm run test:unit -- tests/unit/pareto-compare.test.ts -t "without plan details"`
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "计划明细为空"`
- `npm run test:unit -- tests/unit/pareto-compare.test.ts`
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium`
- `npm run test:unit:coverage`

## 发布说明
- 15 天灰度观察按 owner 指令跳过/延期，不纳入当前切片完成条件。
