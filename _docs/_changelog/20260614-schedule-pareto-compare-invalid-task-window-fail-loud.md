# 2026-06-14 多目标对比计划项时间窗无效 Fail-Loud

## 变更
- `ParetoCompare.vue` 在任一对比方案计划项时间不可解析，或 `plannedEndTime <= plannedStartTime` 时，不再进入可采用状态。
- 该后端契约缺口会展示 `role="alert"` 的 `批量优化对比失败: 后端对比方案计划项时间窗无效`。
- 失败后不会展示推荐卡或“采用此方案”按钮，避免倒置时间窗或非法时间字符串的方案进入采纳路径。
- 补充单测和 Chromium 真实浏览器用例，覆盖计划项时间窗无效的 fail-loud 行为。

## 验证
- RED：`npm run test:unit -- tests/unit/pareto-compare.test.ts -t "invalid plan task time window"` 曾失败，旧逻辑仍渲染推荐卡和采用按钮。
- GREEN：`npm run test:unit -- tests/unit/pareto-compare.test.ts -t "invalid plan task time window"`，1 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "时间窗无效"`，1 passed。
- GREEN：`npm run test:unit -- tests/unit/pareto-compare.test.ts`，9 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium`，55 passed。
- GREEN：`npm run test:unit:coverage`，105 files / 711 tests passed，lines 83.28%，`ParetoCompare.vue` lines 91.20%。

## 范围
- 继续深挖现有排产多目标对比关键路径，不新增业务范围。
- 15 天灰度观察按 owner 指令跳过/延期，不作为当前阻塞项。
