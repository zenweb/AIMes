# 2026-06-14 多目标对比利用率摘要不一致 Fail-Loud

## 变更
- `ParetoCompare.vue` 新增顶层 `utilizationRate` 与 `plan.overallUtilizationRate` 一致性校验。
- 当后端返回的对比 KPI 利用率与计划摘要利用率不一致时，展示 `批量优化对比失败: 后端对比方案利用率与计划摘要不一致`。
- 失败后不渲染推荐卡、图表或“采用此方案”入口，避免 KPI 表、雷达图、推荐理由和计划摘要使用互相冲突的利用率。
- 补充单测和 Chromium 真实浏览器用例，覆盖 `utilizationRate: 0.86` 但 `plan.overallUtilizationRate: 0.72` 的 fail-loud 行为。

## 验证
- RED：`npm run test:unit -- tests/unit/pareto-compare.test.ts -t "utilization rate differs"` 曾失败，旧逻辑接受不一致摘要并继续渲染推荐/采用入口。
- RED：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "利用率与计划摘要不一致"` 曾失败，真实浏览器未出现 `.error-msg[role="alert"]`。
- GREEN：`npm run test:unit -- tests/unit/pareto-compare.test.ts -t "utilization rate differs"`，1 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "利用率与计划摘要不一致"`，1 passed。
- GREEN：`npm run test:unit -- tests/unit/pareto-compare.test.ts`，31 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium`，76 passed，1 flaky retry passed；波动用例是既有“批量方案反馈同步失败”路径，非本片新增利用率摘要校验。
- GREEN：`npm run test:unit:coverage`，105 files / 733 tests passed，lines 83.45%，`ParetoCompare.vue` lines 93.87%。

## 范围
- 继续深挖现有排产多目标对比关键路径，不新增业务范围。
- 15 天灰度观察按 owner 指令跳过/延期，不作为当前阻塞项。
