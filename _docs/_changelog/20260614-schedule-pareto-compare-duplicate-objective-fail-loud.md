# 2026-06-14 多目标对比目标标识重复 Fail-Loud

## 变更
- `ParetoCompare.vue` 在后端返回多个对比方案复用同一个 `objective` key 时，不再进入可推荐、可切换、可采用状态。
- 新增 `hasDuplicateObjectiveKeys` 响应契约校验，防止 `ganttDataByObjective[item.objective]` 被后续方案覆盖。
- 命中时展示 `批量优化对比失败: 后端对比方案目标标识重复`。
- 失败后不展示推荐卡或“采用此方案”按钮，避免重复 active/best 行、重复 tab 和采用目标歧义进入用户关键路径。
- 补充单测和 Chromium 真实浏览器用例，覆盖两个方案同时使用 `objective: 'balanced'` 的 fail-loud 行为。

## 验证
- RED：`npm run test:unit -- tests/unit/pareto-compare.test.ts -t "same objective key"` 曾失败，旧逻辑仍渲染推荐和采用入口。
- RED：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "目标标识重复"` 曾失败，旧逻辑没有展示 `.error-msg[role="alert"]`。
- GREEN：`npm run test:unit -- tests/unit/pareto-compare.test.ts -t "same objective key"`，1 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "目标标识重复"`，1 passed。
- GREEN：`npm run test:unit -- tests/unit/pareto-compare.test.ts`，24 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium`，exit code 0；输出包含 69 passed、1 flaky，flaky 为既有“批量方案反馈同步失败”用例，随后窄跑通过。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "批量方案反馈同步失败"`，1 passed。
- GREEN：`npm run test:unit:coverage`，105 files / 726 tests passed，lines 83.42%，`ParetoCompare.vue` lines 93.43%。

## 范围
- 继续深挖现有排产多目标对比关键路径，不新增业务范围。
- 15 天灰度观察按 owner 指令跳过/延期，不作为当前阻塞项。
