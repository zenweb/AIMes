# 2026-06-14 排产拖拽缺少计划 ID Fail-Loud

## 变更
- `ScheduleBoard.vue` 在拖拽写回时区分任务缺失和排产计划 ID 缺失。
- 当前计划缺少 ID 时，不再静默返回，而是在甘特区域展示 `保存失败: 当前排产计划缺少 ID，无法写回任务 {taskId}`。
- 任务 ID 不存在时，同样展示 `保存失败: 未找到可写回的排产任务 {taskId}`。
- 新增单测覆盖“任务存在但计划 ID 缺失”的正式写回失败路径。
- 新增 Chromium 真实浏览器用例：后端返回真实 dhtmlx 排产载荷但 `id` 为空，拖拽任务条后展示无法写回提示，且不会调用 reschedule API。

## 验证
- RED：`npm run test:unit -- tests/unit/schedule-board.test.ts -t "drag reschedule cannot write back without a schedule plan id"` 曾失败，旧逻辑没有 `[role="alert"]`。
- GREEN：`npm run test:unit -- tests/unit/schedule-board.test.ts -t "drag reschedule cannot write back without a schedule plan id"`，1 passed。
- GREEN：`npm run test:unit -- tests/unit/schedule-board.test.ts`，33 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium`，46 passed。
- GREEN：`npm run test:unit:coverage`，105 files / 702 tests passed，lines 83.23%，`ScheduleBoard.vue` lines 77.18%。

## 范围
- 继续深挖现有排产正式写回路径，不新增业务范围。
- 15 天灰度观察按 owner 指令跳过/延期，不作为当前阻塞项。
