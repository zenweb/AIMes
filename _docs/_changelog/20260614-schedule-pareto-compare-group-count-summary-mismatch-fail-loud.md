# 2026-06-14 多目标对比分组数摘要不一致 Fail-Loud

## 变更
- `ParetoCompare.vue` 新增顶层 `groupCount` 与 `plan.groupCount` 一致性校验。
- 当后端同时返回两处字段且数值不一致时，展示 `批量优化对比失败: 后端对比方案分组数与计划摘要不一致`。
- 失败后不渲染推荐卡、图表或“采用此方案”入口，避免 KPI 表与计划摘要给出互相矛盾的分组数。
- 补充单测和 Chromium 真实浏览器用例，覆盖 `groupCount: 1` 但 `plan.groupCount: 2` 的 fail-loud 行为。

## 验证
- RED：`npm run test:unit -- tests/unit/pareto-compare.test.ts -t "group count differs"` 曾失败，旧逻辑接受不一致摘要并继续渲染推荐/采用入口。
- RED：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "分组数与计划摘要不一致"` 曾失败，真实浏览器未出现 `.error-msg[role="alert"]`。
- GREEN：`npm run test:unit -- tests/unit/pareto-compare.test.ts -t "group count differs"`，1 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "分组数与计划摘要不一致"`，1 passed。
- GREEN：`npm run test:unit -- tests/unit/pareto-compare.test.ts`，29 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium`，75 passed。
- GREEN：`npm run test:unit:coverage`，105 files / 731 tests passed，lines 83.44%，`ParetoCompare.vue` lines 93.75%。

## 范围
- 继续深挖现有排产多目标对比关键路径，不新增业务范围。
- 15 天灰度观察按 owner 指令跳过/延期，不作为当前阻塞项。
