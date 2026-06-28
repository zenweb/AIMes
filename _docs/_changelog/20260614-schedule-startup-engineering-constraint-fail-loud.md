# 2026-06-14 排产启动工程约束 Fail-Loud

## 变更
- `ScheduleBoard.vue` 启动时改为隔离读取 BOM/ECN 约束与工艺能力约束。
- 任一启动工程约束证据失败时，汇总显示 `工程约束启动证据加载失败`，但继续加载正式排产主数据。
- 新增单测覆盖启动工程约束同步失败时排产计划仍可用。
- 新增 Chromium 真实浏览器用例覆盖工程约束证据失败时，正式排产主数据仍能渲染。

## 验证
- RED：`npm run test:unit -- tests/unit/schedule-board.test.ts` 曾失败，确认旧代码会因 mounted hook 异常阻断 `getCurrentPlan`。
- GREEN：`npm run test:unit -- tests/unit/schedule-board.test.ts`，27 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts -g "工程约束启动证据失败" --project=chromium`，1 passed。
- GREEN：`npm run test:unit:coverage`，105 files / 684 tests passed，lines 83.14%，`ScheduleBoard.vue` lines 75.78%。

## Fail-Loud
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium` 当前非全绿：35 passed，4 failed。
- 4 个失败集中在既有真实 dhtmlx 用例，失败症状为 `.gantt-e2e-markers` 期望 0 但实际 1，另有一次重试点击 `.adopt-suggestion` 超时。
- 新增的“工程约束启动证据失败”真实浏览器用例已通过；全文件残留失败需作为下一片继续追。

## 备注
- 15 天灰度观察按 owner 指令跳过/延期，不作为本轮继续工作的阻塞项。
