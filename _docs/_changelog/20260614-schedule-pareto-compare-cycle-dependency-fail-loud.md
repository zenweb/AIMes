# 2026-06-14 多目标对比计划项循环依赖 Fail-Loud

## 变更
- `ParetoCompare.vue` 在同一对比方案计划明细中发现多节点循环依赖时，不再进入可采用状态。
- 该后端契约缺口会展示 `role="alert"` 的 `批量优化对比失败: 后端对比方案计划项存在循环依赖`。
- 失败后不会展示推荐卡或“采用此方案”按钮，避免 A 依赖 B、B 又依赖 A 这类执行拓扑无效的方案进入采纳、甘特图和审计链路。
- 补充单测和 Chromium 真实浏览器用例，覆盖多节点循环依赖的 fail-loud 行为。

## 验证
- RED：`npm run test:unit -- tests/unit/pareto-compare.test.ts -t "dependency cycle"` 曾失败，旧逻辑仍渲染推荐卡和采用按钮。
- GREEN：`npm run test:unit -- tests/unit/pareto-compare.test.ts -t "dependency cycle"`，1 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "循环依赖"`，1 passed。
- GREEN：`npm run test:unit -- tests/unit/pareto-compare.test.ts`，14 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium`，60 passed。
- GREEN：`npm run test:unit:coverage`，105 files / 716 tests passed，lines 83.29%，`ParetoCompare.vue` lines 90.43%。

## 范围
- 继续深挖现有排产多目标对比关键路径，不新增业务范围。
- 15 天灰度观察按 owner 指令跳过/延期，不作为当前阻塞项。
