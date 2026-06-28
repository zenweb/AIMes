# 2026-06-14 Plan - 排产优化缺少计划 Fail-Loud

## 成功标准
- 当排产优化接口返回 200 但缺少 `plan` 时，页面必须展示可访问的优化失败提示。
- 当前甘特图和指标不得被缺失计划的异常结果覆盖。
- 排产优化成功、普通优化失败和真实浏览器排产路径必须继续通过。
- 相关单测、真实浏览器用例、覆盖率总检必须通过。

## 执行
- 在 `schedule-board.test.ts` 增加优化成功响应缺少 `plan` 的 RED 用例。
- 在 `ScheduleBoard.vue` 的 `handleOptimize` 成功分支补 `plan` 契约校验。
- 在 `scheduling.spec.ts` 增加 Chromium 用例，模拟优化 API 返回 200 但无 `plan`。
- 跑完整相关验证并记录结果。

## 验证命令
- `npm run test:unit -- tests/unit/schedule-board.test.ts -t "optimization succeeds without a schedule plan"`
- `npm run test:unit -- tests/unit/schedule-board.test.ts -t "optimization"`
- `npm run test:unit -- tests/unit/schedule-board.test.ts`
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "排产优化返回 200 但缺少计划"`
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium`
- `npm run test:unit:coverage`

## 发布说明
- 15 天灰度观察按 owner 指令跳过/延期，不纳入当前切片完成条件。
