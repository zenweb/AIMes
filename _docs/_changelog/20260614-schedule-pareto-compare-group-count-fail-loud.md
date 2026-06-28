# 2026-06-14 多目标对比分组数无效 Fail-Loud

## 变更
- `ParetoCompare.vue` 新增 `groupCount` 契约校验。
- 当后端对比项返回非有限数或负数分组数时，展示 `批量优化对比失败: 后端对比方案分组数无效`。
- 失败后不渲染推荐卡、对比图表或“采用此方案”入口，避免把坏 KPI 带入雷达图、柱状图和采纳流程。
- 补充单测和 Chromium 真实浏览器用例，覆盖 `groupCount: -1` 的 fail-loud 行为。

## 验证
- RED：`npm run test:unit -- tests/unit/pareto-compare.test.ts -t "invalid group count"` 曾失败，旧逻辑渲染 `-1` 分组数并保留推荐/采用入口。
- RED：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "分组数无效"` 曾失败，真实浏览器未出现 `.error-msg[role="alert"]`。
- GREEN：`npm run test:unit -- tests/unit/pareto-compare.test.ts -t "invalid group count"`，1 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "分组数无效"`，1 passed。
- GREEN：`npm run test:unit -- tests/unit/pareto-compare.test.ts`，28 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium`，74 passed。
- GREEN：`npm run test:unit:coverage`，105 files / 730 tests passed，lines 83.44%，`ParetoCompare.vue` lines 93.68%。

## 范围
- 继续深挖现有排产多目标对比关键路径，不新增业务范围。
- 15 天灰度观察按 owner 指令跳过/延期，不作为当前阻塞项。
