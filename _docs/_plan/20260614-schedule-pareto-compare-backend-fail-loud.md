# 2026-06-14 Plan - 多目标对比后端失败 Fail-Loud

## 成功标准
- 当 `optimize-compare` 真实后端失败时，页面必须展示可访问失败提示。
- 真实后端失败不得展示推荐方案卡片，也不得展示“采用此方案”按钮。
- 离线演示模式仍可展示 demo 推荐。
- 相关单测、真实浏览器用例、覆盖率总检必须通过。

## 执行
- 在 `pareto-compare.test.ts` 增加真实后端失败的 RED 用例。
- 在 `ParetoCompare.vue` 中区分真实失败和 `OfflineDemoApiError`。
- 在 `scheduling.spec.ts` 增加 Chromium 用例，模拟 `optimize-compare` 503。
- 跑相关验证并记录 flaky 情况。

## 验证命令
- `npm run test:unit -- tests/unit/pareto-compare.test.ts -t "fails loud"`
- `npm run test:unit -- tests/unit/pareto-compare.test.ts`
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "多目标对比后端失败"`
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium`
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "批量方案反馈同步失败"`
- `npm run test:unit:coverage`

## 发布说明
- 15 天灰度观察按 owner 指令跳过/延期，不纳入当前切片完成条件。
