# 2026-06-14 多目标对比计划项身份缺失 Fail-Loud

## 变更
- `ParetoCompare.vue` 在任一对比方案计划项缺少 `id` 或 `workOrderNumber` 时，不再进入可采用状态。
- 该后端契约缺口会展示 `role="alert"` 的 `批量优化对比失败: 后端对比方案计划项缺少任务身份标识`。
- 失败后不会展示推荐卡或“采用此方案”按钮，避免缺少任务 ID 或工单展示编号的方案进入采纳、甘特图和审计链路。
- 补充单测和 Chromium 真实浏览器用例，覆盖计划项缺少任务身份标识的 fail-loud 行为。

## 验证
- RED：`npm run test:unit -- tests/unit/pareto-compare.test.ts -t "without a task identity"` 曾失败，旧逻辑仍渲染推荐卡和采用按钮。
- GREEN：`npm run test:unit -- tests/unit/pareto-compare.test.ts -t "without a task identity"`，1 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "缺少任务身份标识"`，1 passed。
- GREEN：`npm run test:unit -- tests/unit/pareto-compare.test.ts`，11 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium`，57 passed。
- GREEN：`npm run test:unit:coverage`，105 files / 713 tests passed，lines 83.29%，`ParetoCompare.vue` lines 91.39%。

## 范围
- 继续深挖现有排产多目标对比关键路径，不新增业务范围。
- 15 天灰度观察按 owner 指令跳过/延期，不作为当前阻塞项。
