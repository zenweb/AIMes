# 2026-06-14 多目标对比空方案 Fail-Loud

## 变更
- `ParetoCompare.vue` 在 `optimize-compare` 返回 200 但 `items` 为空时，不再展示“暂无对比数据”的普通空态。
- 空方案被视为无可采用排产方案的异常结果，页面展示 `role="alert"` 的 `批量优化对比失败: 后端未返回可对比排产方案`。
- 失败后清空推荐目标和当前 tab，隐藏推荐卡与“采用此方案”按钮，避免调度员误以为多目标优化已产出可落地方案。
- 补充单测和 Chromium 真实浏览器用例，覆盖 200 空 `items` 的 fail-loud 行为。

## 验证
- RED：`npm run test:unit -- tests/unit/pareto-compare.test.ts -t "without comparable plans"` 曾失败，旧逻辑展示 `.empty-state`。
- GREEN：`npm run test:unit -- tests/unit/pareto-compare.test.ts -t "without comparable plans"`，1 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "多目标对比返回空方案"`，1 passed。
- GREEN：`npm run test:unit -- tests/unit/pareto-compare.test.ts`，4 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium`，50 passed。
- GREEN：`npm run test:unit:coverage`，105 files / 706 tests passed，lines 83.26%，`ParetoCompare.vue` lines 90.53%。

## 范围
- 继续深挖现有排产多目标对比关键路径，不新增业务范围。
- 15 天灰度观察按 owner 指令跳过/延期，不作为当前阻塞项。
