# 2026-06-14 Plan - 多目标方案缺少计划 Fail-Loud

## 成功标准
- 当多目标方案采用触发的优化接口返回 200 但缺少 `plan` 时，页面必须展示可访问的优化失败提示。
- 对比弹窗必须保持打开，当前目标不得切换到待采用目标。
- 不得提交 `batch_optimize_apply` 采纳反馈。
- 相关单测、真实浏览器用例、覆盖率总检必须通过。

## 执行
- 在 `schedule-board.test.ts` 增加多目标采用缺少 `plan` 的 RED 用例。
- 将 `handleOptimize` 调整为可接收目标并返回成功布尔值。
- 将 `onApplyObjective` 调整为优化成功后再提交采纳反馈。
- 在 `scheduling.spec.ts` 增加 Chromium 用例，模拟 `optimize-compare` 正常但 `optimize` 返回 200 无 `plan`。

## 验证命令
- `npm run test:unit -- tests/unit/schedule-board.test.ts -t "keeps batch objective adoption pending"`
- `npm run test:unit -- tests/unit/schedule-board.test.ts -t "batch objective"`
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "多目标方案优化缺少计划"`
- `npm run test:unit -- tests/unit/schedule-board.test.ts`
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium`
- `npm run test:unit:coverage`

## 发布说明
- 15 天灰度观察按 owner 指令跳过/延期，不纳入当前切片完成条件。
