# 2026-06-14 多目标对比缺少推荐方案 Fail-Loud

## 变更
- `ParetoCompare.vue` 在 `optimize-compare` 返回非空 `items` 但省略或空白 `bestOverallObjective` 时，展示 `role="alert"` 失败提示。
- 新增错误文案：`批量优化对比失败: 后端对比结果缺少推荐方案`。
- 失败后清空对比项、推荐目标和当前 tab，不展示推荐卡或“采用此方案”入口，避免用户在无后端推荐依据时采纳方案。
- 补充单测和 Chromium 真实浏览器用例，覆盖缺少推荐方案的 fail-loud 行为。

## 后端契约依据
- `SchedulingAppService.BatchOptimizeAsync` 对每个 objective 计算 score，并在非空目标循环中设置 `BestOverallObjective`。
- 因此前端收到非空 `items` 但没有 `bestOverallObjective` 属于后端对比契约破损，不是有效的“手动选择”状态。

## 验证
- RED：`npm run test:unit -- tests/unit/pareto-compare.test.ts -t "recommended objective"` 曾失败，旧逻辑继续渲染对比内容而没有告警。
- RED：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "缺少推荐方案"` 曾失败，真实浏览器未出现 `.error-msg[role="alert"]`。
- GREEN：`npm run test:unit -- tests/unit/pareto-compare.test.ts -t "recommended objective"`，1 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "缺少推荐方案"`，1 passed。
- GREEN：`npm run test:unit -- tests/unit/pareto-compare.test.ts`，27 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium`，73 passed。
- GREEN：`npm run test:unit:coverage`，105 files / 729 tests passed，lines 83.43%，`ParetoCompare.vue` lines 93.61%。

## 范围
- 继续深挖现有排产多目标对比关键路径，不新增业务范围。
- 15 天灰度观察按 owner 指令跳过/延期，不作为当前阻塞项。
