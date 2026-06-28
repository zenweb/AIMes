# 2026-06-14 Plan - 多目标对比计划项时间窗无效 Fail-Loud

## 成功标准
- 当任一对比方案计划项时间不可解析，或结束时间不晚于开始时间时，页面必须展示可访问失败提示。
- 不得展示推荐方案卡片或“采用此方案”按钮。
- 相关单测、真实浏览器用例、覆盖率总检必须通过。

## 执行
- 在 `pareto-compare.test.ts` 增加结束时间早于开始时间的 RED 用例。
- 在 `ParetoCompare.vue` 中校验每个计划项时间窗可解析且结束晚于开始。
- 在 `scheduling.spec.ts` 增加 Chromium 用例，模拟后端返回倒置时间窗的计划项。
- 跑完整相关验证并记录覆盖率。

## 验证命令
- `npm run test:unit -- tests/unit/pareto-compare.test.ts -t "invalid plan task time window"`
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "时间窗无效"`
- `npm run test:unit -- tests/unit/pareto-compare.test.ts`
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium`
- `npm run test:unit:coverage`

## 发布说明
- 15 天灰度观察按 owner 指令跳过/延期，不纳入当前切片完成条件。
