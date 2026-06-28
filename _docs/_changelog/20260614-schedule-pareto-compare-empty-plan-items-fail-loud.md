# 2026-06-14 多目标对比计划明细为空 Fail-Loud

## 变更
- `ParetoCompare.vue` 在对比项 `totalWorkOrders > 0` 但 `plan.items` 为空时，不再进入可采用状态。
- 该契约矛盾会展示 `role="alert"` 的 `批量优化对比失败: 后端对比方案计划明细为空`。
- 失败后不会展示推荐卡或“采用此方案”按钮，避免 KPI 声称有工单但甘特图无任务的方案被采纳。
- 补充单测和 Chromium 真实浏览器用例，覆盖“有工单但计划明细为空”的 fail-loud 行为。

## 验证
- RED：`npm run test:unit -- tests/unit/pareto-compare.test.ts -t "without plan details"` 曾失败，旧逻辑渲染推荐卡和可采用表格行。
- GREEN：`npm run test:unit -- tests/unit/pareto-compare.test.ts -t "without plan details"`，1 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "计划明细为空"`，1 passed。
- GREEN：`npm run test:unit -- tests/unit/pareto-compare.test.ts`，7 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium`，53 tests passed with 1 existing flaky retried successfully。
- GREEN：`npm run test:unit:coverage`，105 files / 709 tests passed，lines 83.27%，`ParetoCompare.vue` lines 90.85%。

## 范围
- 继续深挖现有排产多目标对比关键路径，不新增业务范围。
- 15 天灰度观察按 owner 指令跳过/延期，不作为当前阻塞项。
