# 2026-06-14 Plan - 多目标对比分组数无效 Fail-Loud

## 成功标准
- 当任一对比项 `groupCount` 为负数或非有限数时，页面必须展示可访问失败提示。
- 不得展示推荐方案卡片或“采用此方案”入口。
- 相关单测、真实浏览器用例、覆盖率总检必须通过。

## 执行
- 在 `pareto-compare.test.ts` 增加 `groupCount: -1` 的 RED 用例。
- 在 `scheduling.spec.ts` 增加 Chromium 用例，模拟后端返回无效分组数。
- 在 `ParetoCompare.vue` 中补充最小校验：`!Number.isFinite(groupCount) || groupCount < 0` 时 fail-loud。
- 跑完整相关验证并记录覆盖率。

## 验证命令
- `npm run test:unit -- tests/unit/pareto-compare.test.ts -t "invalid group count"`
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "分组数无效"`
- `npm run test:unit -- tests/unit/pareto-compare.test.ts`
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium`
- `npm run test:unit:coverage`

## 发布说明
- 15 天灰度观察按 owner 指令跳过/延期，不纳入当前切片完成条件。
