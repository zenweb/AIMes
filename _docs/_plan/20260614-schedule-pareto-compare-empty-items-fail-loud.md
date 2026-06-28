# 2026-06-14 Plan - 多目标对比空方案 Fail-Loud

## 成功标准
- 当 `optimize-compare` 返回 200 但没有可对比方案时，页面必须展示可访问失败提示。
- 不得展示普通空态、推荐方案卡片或“采用此方案”按钮。
- 相关单测、真实浏览器用例、覆盖率总检必须通过。

## 执行
- 在 `pareto-compare.test.ts` 增加 200 空 `items` 的 RED 用例。
- 在 `ParetoCompare.vue` 中把空 `items` 判定为异常优化结果。
- 在 `scheduling.spec.ts` 增加 Chromium 用例，模拟 `optimize-compare` 返回 `{ bestOverallObjective: 'balanced', items: [] }`。
- 跑完整相关验证并记录覆盖率。

## 验证命令
- `npm run test:unit -- tests/unit/pareto-compare.test.ts -t "without comparable plans"`
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "多目标对比返回空方案"`
- `npm run test:unit -- tests/unit/pareto-compare.test.ts`
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium`
- `npm run test:unit:coverage`

## 发布说明
- 15 天灰度观察按 owner 指令跳过/延期，不纳入当前切片完成条件。
