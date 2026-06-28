# 2026-06-14 Plan - 多目标对比计划项身份缺失 Fail-Loud

## 成功标准
- 当任一对比方案计划项缺少 `id` 或 `workOrderNumber` 时，页面必须展示可访问失败提示。
- 不得展示推荐方案卡片或“采用此方案”按钮。
- 相关单测、真实浏览器用例、覆盖率总检必须通过。

## 执行
- 在 `pareto-compare.test.ts` 增加缺少任务 ID 的 RED 用例。
- 在 `ParetoCompare.vue` 中校验每个计划项具备任务 ID 和工单展示编号。
- 在 `scheduling.spec.ts` 增加 Chromium 用例，模拟后端返回缺少任务 ID 的计划项。
- 跑完整相关验证并记录覆盖率。

## 验证命令
- `npm run test:unit -- tests/unit/pareto-compare.test.ts -t "without a task identity"`
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "缺少任务身份标识"`
- `npm run test:unit -- tests/unit/pareto-compare.test.ts`
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium`
- `npm run test:unit:coverage`

## 发布说明
- 15 天灰度观察按 owner 指令跳过/延期，不纳入当前切片完成条件。
