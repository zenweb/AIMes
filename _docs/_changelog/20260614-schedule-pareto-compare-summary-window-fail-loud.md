# 2026-06-14 多目标对比计划摘要时间窗 Fail-Loud

## 变更
- `ParetoCompare.vue` 在对比方案的计划摘要时间窗未覆盖计划明细任务时间窗时，不再进入可采用状态。
- 该后端契约缺口会展示 `role="alert"` 的 `批量优化对比失败: 后端对比方案计划摘要时间窗未覆盖计划明细`。
- 失败后不会展示推荐卡或“采用此方案”按钮，避免摘要边界与甘特明细不一致的方案进入采纳、甘特图和审计链路。
- 补充单测和 Chromium 真实浏览器用例，覆盖摘要时间窗短于计划明细的 fail-loud 行为。

## 验证
- RED：`npm run test:unit -- tests/unit/pareto-compare.test.ts -t "summary window"` 曾失败，旧逻辑仍渲染推荐卡和采用按钮。
- GREEN：`npm run test:unit -- tests/unit/pareto-compare.test.ts -t "summary window"`，1 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "摘要时间窗"`，1 passed。
- GREEN：`npm run test:unit -- tests/unit/pareto-compare.test.ts`，15 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium`，61 passed。
- GREEN：`npm run test:unit:coverage`，105 files / 717 tests passed，lines 83.30%，`ParetoCompare.vue` lines 90.41%。

## 范围
- 继续深挖现有排产多目标对比关键路径，不新增业务范围。
- 15 天灰度观察按 owner 指令跳过/延期，不作为当前阻塞项。
