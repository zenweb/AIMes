# 2026-06-14 多目标对比同设备顺序时间 Fail-Loud

## 变更
- `ParetoCompare.vue` 在同一设备的计划项 `sequence` 与时间顺序不一致时，不再进入可采用状态。
- 新增同设备顺序时间校验：按 `equipmentId` 分组并按 `plannedStartTime` 排序后，后续计划项的 `sequence` 不得小于前一项。
- 命中时展示 `批量优化对比失败: 后端对比方案同设备计划项顺序与时间不一致`。
- 失败后不展示推荐卡或“采用此方案”按钮，避免同设备执行顺序语义反向的方案进入采纳、甘特图和审计链路。
- 补充单测和 Chromium 真实浏览器用例，覆盖同设备 sequence=2 先于 sequence=1 执行的 fail-loud 行为。

## 验证
- RED：`npm run test:unit -- tests/unit/pareto-compare.test.ts -t "sequence runs"` 曾失败，旧逻辑仍渲染推荐卡和采用按钮。
- GREEN：`npm run test:unit -- tests/unit/pareto-compare.test.ts -t "sequence runs"`，1 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "顺序与时间不一致"`，1 passed。
- GREEN：`npm run test:unit -- tests/unit/pareto-compare.test.ts`，18 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium`，64 passed。
- GREEN：`npm run test:unit:coverage`，105 files / 720 tests passed，lines 83.39%，`ParetoCompare.vue` lines 92.99%。
- GREEN：敏感信息扫描 touched files，exit code 1，未命中。

## 范围
- 继续深挖现有排产多目标对比关键路径，不新增业务范围。
- 15 天灰度观察按 owner 指令跳过/延期，不作为当前阻塞项。
