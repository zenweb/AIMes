# 2026-06-14 排产优化缺少计划 Fail-Loud

## 变更
- `ScheduleBoard.vue` 在排产优化接口返回 200 但缺少 `plan` 时，不再静默结束。
- 缺少排产计划时展示 `优化失败: 后端优化结果缺少排产计划`，保留当前甘特图和指标不被空结果覆盖。
- 新增单测覆盖“优化成功响应但缺少 schedule plan”的失败可见路径。
- 新增 Chromium 真实浏览器用例：拦截优化 API 返回无 `plan` 的 200 响应，验证页面出现 fail-loud 告警且任务数量不变。

## 验证
- RED：`npm run test:unit -- tests/unit/schedule-board.test.ts -t "optimization succeeds without a schedule plan"` 曾失败，旧逻辑没有 `[role="alert"]`。
- GREEN：`npm run test:unit -- tests/unit/schedule-board.test.ts -t "optimization succeeds without a schedule plan"`，1 passed。
- GREEN：`npm run test:unit -- tests/unit/schedule-board.test.ts -t "optimization"`，5 passed。
- GREEN：`npm run test:unit -- tests/unit/schedule-board.test.ts`，34 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "排产优化返回 200 但缺少计划"`，1 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium`，47 passed。
- GREEN：`npm run test:unit:coverage`，105 files / 703 tests passed，lines 83.23%，`ScheduleBoard.vue` lines 77.21%。

## 范围
- 继续深挖现有排产优化关键路径，不新增业务范围。
- 15 天灰度观察按 owner 指令跳过/延期，不作为当前阻塞项。
