# 2026-06-14 Plan - 多目标对比换型分钟摘要不一致 Fail-Loud

## 成功标准
- 当任一对比项顶层 `totalChangeoverMinutes` 与存在的 `plan.totalChangeoverMinutes` 不一致时，页面必须展示可访问失败提示。
- 不得展示推荐方案卡片或“采用此方案”入口。
- 相关单测、真实浏览器用例、覆盖率总检必须通过。

## 执行
- 在 `pareto-compare.test.ts` 增加 `totalChangeoverMinutes: 28`、`plan.totalChangeoverMinutes: 60` 的 RED 用例。
- 在 `scheduling.spec.ts` 增加 Chromium 用例，模拟后端返回冲突换型分钟摘要。
- 在 `ParetoCompare.vue` 中补充最小校验：仅当 `plan.totalChangeoverMinutes !== undefined` 时比较顶层和计划摘要换型分钟。
- 跑完整相关验证并记录覆盖率。

## 验证命令
- `npm run test:unit -- tests/unit/pareto-compare.test.ts -t "changeover minutes differ"`
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "换型分钟与计划摘要不一致"`
- `npm run test:unit -- tests/unit/pareto-compare.test.ts`
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium`
- `npm run test:unit:coverage`

## 发布说明
- 15 天灰度观察按 owner 指令跳过/延期，不纳入当前切片完成条件。
