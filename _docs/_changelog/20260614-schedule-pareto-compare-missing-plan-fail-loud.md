# 2026-06-14 多目标对比缺少排产计划 Fail-Loud

## 变更
- `ParetoCompare.vue` 在 `optimize-compare` 返回的任一对比项缺少 `plan` 或 `plan.items` 不是数组时，不再进入可采用状态。
- 该契约不完整会展示 `role="alert"` 的 `批量优化对比失败: 后端对比方案缺少排产计划`。
- 失败后不会展示推荐卡或“采用此方案”按钮，避免只有指标但没有可落地排产计划的方案被采纳。
- 补充单测和 Chromium 真实浏览器用例，覆盖单个对比项缺少排产计划的 fail-loud 行为。

## 验证
- RED：`npm run test:unit -- tests/unit/pareto-compare.test.ts -t "missing its schedule plan"` 曾失败，旧逻辑渲染推荐卡和可采用表格行。
- GREEN：`npm run test:unit -- tests/unit/pareto-compare.test.ts -t "missing its schedule plan"`，1 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "缺少排产计划时真实浏览器展示 fail-loud"`，1 passed。
- GREEN：`npm run test:unit -- tests/unit/pareto-compare.test.ts`，6 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium`，52 passed。
- GREEN：`npm run test:unit:coverage`，105 files / 708 tests passed，lines 83.27%，`ParetoCompare.vue` lines 90.75%。

## 范围
- 继续深挖现有排产多目标对比关键路径，不新增业务范围。
- 15 天灰度观察按 owner 指令跳过/延期，不作为当前阻塞项。
