# 2026-06-14 多目标对比排产计划标识重复 Fail-Loud

## 变更
- `ParetoCompare.vue` 在后端返回多个对比目标复用同一个 `plan.id` 时，不再进入可推荐、可切换、可采用状态。
- 新增 `hasDuplicatePlanIds` 响应契约校验，防止不同优化目标指向同一个排产计划标识后造成采用和审计身份歧义。
- 命中时展示 `批量优化对比失败: 后端对比方案排产计划标识重复`。
- 失败后不展示推荐卡或“采用此方案”按钮，避免同一个计划 ID 同时代表交期优先、综合平衡等不同方案。
- 补充单测和 Chromium 真实浏览器用例，覆盖 `due_date` 与 `balanced` 复用同一个 `plan.id` 的 fail-loud 行为。

## 验证
- RED：`npm run test:unit -- tests/unit/pareto-compare.test.ts -t "same plan id"` 曾失败，旧逻辑仍渲染推荐和采用入口。
- RED：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "排产计划标识重复"` 曾失败，旧逻辑没有展示 `.error-msg[role="alert"]`。
- GREEN：`npm run test:unit -- tests/unit/pareto-compare.test.ts -t "same plan id"`，1 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "排产计划标识重复"`，1 passed。
- GREEN：`npm run test:unit -- tests/unit/pareto-compare.test.ts`，25 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium`，71 passed。
- GREEN：`npm run test:unit:coverage`，105 files / 727 tests passed，lines 83.42%，`ParetoCompare.vue` lines 93.5%。

## 范围
- 继续深挖现有排产多目标对比关键路径，不新增业务范围。
- 15 天灰度观察按 owner 指令跳过/延期，不作为当前阻塞项。
