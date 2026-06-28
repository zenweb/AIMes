# 2026-06-14 Plan - 排产拖拽缺少计划 ID Fail-Loud

## 成功标准
- 当用户拖拽真实任务条，但当前排产计划缺少 ID 时，页面必须展示可访问的保存失败提示。
- 该失败不得调用 reschedule API。
- 成功保存和后端保存失败路径必须继续通过。
- 相关单测、真实浏览器用例、覆盖率总检必须通过。

## 执行
- 在 `schedule-board.test.ts` 增加计划 ID 缺失的 RED 用例。
- 在 `ScheduleBoard.vue` 的 `handleTaskDragEnd` 早退分支补 fail-loud 反馈。
- 在 `scheduling.spec.ts` 增加 Chromium 用例，模拟后端返回真实 dhtmlx 计划但 `id` 为空。
- 跑完整相关验证并记录结果。

## 验证命令
- `npm run test:unit -- tests/unit/schedule-board.test.ts`
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium`
- `npm run test:unit:coverage`

## 发布说明
- 15 天灰度观察按 owner 指令跳过/延期，不纳入当前切片完成条件。
