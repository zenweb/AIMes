# 2026-06-14 多目标对比推荐最高分 Fail-Loud

## 变更
- `ParetoCompare.vue` 新增前端推荐得分复算，沿用后端综合得分公式：利用率 40%、准时率 40%、低换型分钟 20%。
- 当 `bestOverallObjective` 指向的方案不是综合得分最高方案时，展示 `批量优化对比失败: 后端推荐方案不是综合得分最高方案`。
- 失败后不渲染推荐卡或“采用此方案”入口，避免页面把非最高分方案标记为“综合得分最高”并允许采纳。
- 并列最高分场景允许任一最高分目标作为推荐，避免 tie 误报。
- 补充单测和 Chromium 真实浏览器用例，覆盖后端推荐 `due_date` 但 `balanced` 综合得分更高的 fail-loud 行为。

## 验证
- RED：`npm run test:unit -- tests/unit/pareto-compare.test.ts -t "recommended objective is not the highest scoring"` 曾失败，旧逻辑继续渲染非最高分推荐。
- RED：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "推荐方案不是最高分"` 曾失败，真实浏览器未出现 `.error-msg[role="alert"]`。
- GREEN：`npm run test:unit -- tests/unit/pareto-compare.test.ts -t "recommended objective is not the highest scoring"`，1 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "推荐方案不是最高分"`，1 passed。
- GREEN：`npm run test:unit -- tests/unit/pareto-compare.test.ts`，33 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium`，78 passed，1 flaky 重试后 passed。
- GREEN：`npm run test:unit:coverage`，105 files / 735 tests passed，lines 83.47%，`ParetoCompare.vue` lines 94.05%。

## 范围
- 继续深挖现有排产多目标对比关键路径，不新增业务范围。
- 15 天灰度观察按 owner 指令跳过/延期，不作为当前阻塞项。

## 追加：推荐卡可审计分数组成
- `ParetoCompare.vue` 推荐理由展示综合分与分项指标：利用率、准时率、换线分钟、分组数、完工率。
- `scheduling.spec.ts` 追加真实 Chromium 断言，确认推荐卡在用户可见层展示 `综合得分最高：综合分 91.0` 以及 `利用率 86% / 准时率 93% / 换线 28 分钟 / 分组 1 / 完工率 95%`。
- 验证：`npm run test:e2e -- --grep "批量方案反馈同步失败时真实浏览器保留本地目标切换并展示原因"`，1 passed。
