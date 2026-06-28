# 2026-06-14 多目标对比排产计划标识缺失 Fail-Loud

## 变更
- `ParetoCompare.vue` 在后端返回对比方案缺少 `plan.id` 时，不再进入可推荐、可切换、可采用状态。
- 新增 `hasMissingPlanId` 响应契约校验，防止采用反馈缺少 `schedulePlanId` 锚点。
- 命中时展示 `批量优化对比失败: 后端对比方案缺少排产计划标识`。
- 失败后不展示推荐卡或“采用此方案”按钮，避免没有计划身份的方案进入优化、反馈和审计链路。
- 补充单测和 Chromium 真实浏览器用例，覆盖 `plan.id` 为空白字符串的 fail-loud 行为。

## 验证
- RED：`npm run test:unit -- tests/unit/pareto-compare.test.ts -t "missing its plan id"` 曾失败，旧逻辑仍渲染推荐和采用入口。
- RED：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "缺少排产计划标识"` 曾失败，旧逻辑没有展示 `.error-msg[role="alert"]`。
- GREEN：`npm run test:unit -- tests/unit/pareto-compare.test.ts -t "missing its plan id"`，1 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "缺少排产计划标识"`，1 passed。
- GREEN：`npm run test:unit -- tests/unit/pareto-compare.test.ts`，26 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium`，72 passed。
- GREEN：`npm run test:unit:coverage`，105 files / 728 tests passed，lines 83.43%，`ParetoCompare.vue` lines 93.57%。

## 范围
- 继续深挖现有排产多目标对比关键路径，不新增业务范围。
- 15 天灰度观察按 owner 指令跳过/延期，不作为当前阻塞项。
