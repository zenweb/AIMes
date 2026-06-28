# 2026-06-14 多目标对比准时率摘要不一致 Fail-Loud

## 变更
- `ParetoCompare.vue` 新增顶层 `onTimeDeliveryRate` 与 `plan.onTimeDeliveryRate` 一致性校验。
- 当后端返回的对比 KPI 准时率与计划摘要准时率不一致时，展示 `批量优化对比失败: 后端对比方案准时率与计划摘要不一致`。
- 失败后不渲染推荐卡、图表或“采用此方案”入口，避免 KPI 表、雷达图、推荐理由和计划摘要使用互相冲突的准时率。
- 补充单测和 Chromium 真实浏览器用例，覆盖 `onTimeDeliveryRate: 0.93` 但 `plan.onTimeDeliveryRate: 0.74` 的 fail-loud 行为。

## 验证
- RED：`npm run test:unit -- tests/unit/pareto-compare.test.ts -t "on-time delivery rate differs"` 曾失败，旧逻辑接受不一致摘要并继续渲染推荐/采用入口。
- RED：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "准时率与计划摘要不一致"` 曾失败，真实浏览器未出现 `.error-msg[role="alert"]`。
- GREEN：`npm run test:unit -- tests/unit/pareto-compare.test.ts -t "on-time delivery rate differs"`，1 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "准时率与计划摘要不一致"`，1 passed。
- GREEN：`npm run test:unit -- tests/unit/pareto-compare.test.ts`，32 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium`，78 passed。
- GREEN：`npm run test:unit:coverage`，105 files / 734 tests passed，lines 83.46%，`ParetoCompare.vue` lines 93.93%。

## 范围
- 继续深挖现有排产多目标对比关键路径，不新增业务范围。
- 15 天灰度观察按 owner 指令跳过/延期，不作为当前阻塞项。
