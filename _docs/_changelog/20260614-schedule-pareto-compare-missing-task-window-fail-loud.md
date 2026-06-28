# 2026-06-14 多目标对比计划项时间窗缺失 Fail-Loud

## 变更
- `ParetoCompare.vue` 在任一对比方案计划项缺少 `plannedStartTime` 或 `plannedEndTime` 时，不再进入可采用状态。
- 该后端契约缺口会展示 `role="alert"` 的 `批量优化对比失败: 后端对比方案计划项缺少时间窗`。
- 失败后不会展示推荐卡或“采用此方案”按钮，避免缺少任务级排产窗口的方案被误采纳。
- 补充单测和 Chromium 真实浏览器用例，覆盖计划项缺少时间窗的 fail-loud 行为。

## 验证
- RED：`npm run test:unit -- tests/unit/pareto-compare.test.ts -t "without a time window"` 曾失败，旧逻辑仍渲染推荐卡和采用按钮。
- GREEN：`npm run test:unit -- tests/unit/pareto-compare.test.ts -t "without a time window"`，1 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "计划项缺少时间窗"`，1 passed。
- GREEN：`npm run test:unit -- tests/unit/pareto-compare.test.ts`，8 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium`，54 passed。
- GREEN：`npm run test:unit:coverage`，105 files / 710 tests passed，lines 83.28%，`ParetoCompare.vue` lines 90.96%。

## 范围
- 继续深挖现有排产多目标对比关键路径，不新增业务范围。
- 15 天灰度观察按 owner 指令跳过/延期，不作为当前阻塞项。
