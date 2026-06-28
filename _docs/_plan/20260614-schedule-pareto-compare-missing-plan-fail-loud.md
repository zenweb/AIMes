# 2026-06-14 Plan - 多目标对比缺少排产计划 Fail-Loud

## 成功标准
- 当任一对比项缺少可落地 `plan` 时，页面必须展示可访问失败提示。
- 不得展示推荐方案卡片或“采用此方案”按钮。
- 相关单测、真实浏览器用例、覆盖率总检必须通过。

## 执行
- 在 `pareto-compare.test.ts` 增加缺少 `plan` 的 RED 用例。
- 在 `ParetoCompare.vue` 中校验每个返回方案都包含 `plan.items` 数组。
- 在 `scheduling.spec.ts` 增加 Chromium 用例，模拟对比项只有指标没有 `plan`。
- 跑完整相关验证并记录覆盖率。

## 验证命令
- `npm run test:unit -- tests/unit/pareto-compare.test.ts -t "missing its schedule plan"`
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "缺少排产计划时真实浏览器展示 fail-loud"`
- `npm run test:unit -- tests/unit/pareto-compare.test.ts`
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium`
- `npm run test:unit:coverage`

## 发布说明
- 15 天灰度观察按 owner 指令跳过/延期，不纳入当前切片完成条件。
