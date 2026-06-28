# 2026-06-14 批量对比采纳反馈记录

## 变更
- `ScheduleBoard.vue` 在批量对比方案成功采纳后，立即写入 `latestFeedback`。
- “最近反馈”现在会展示 `已采纳批量对比方案`、`批量对比采纳`、目标名称和 `从批量对比中选择此方案`。
- 批量方案反馈同步失败时，页面仍保留本地目标切换、warning、sync-note，同时把采纳动作沉淀到复盘记录。
- 补充单测和 Chromium 真实浏览器断言，覆盖批量对比采纳后的最近反馈可见性。

## 验证
- RED：`npm run test:unit -- tests/unit/schedule-board.test.ts -t "announces batch objective feedback sync failures"` 曾失败，旧逻辑仍显示 `等待调度员决策`。
- GREEN：`npm run test:unit -- tests/unit/schedule-board.test.ts -t "announces batch objective feedback sync failures"`，1 passed。
- GREEN：`npm run test:unit -- tests/unit/schedule-board.test.ts -t "keeps the applied compared plan warning"`，1 passed。
- GREEN：`npm run test:unit -- tests/unit/schedule-board.test.ts`，36 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "批量方案反馈同步失败"`，1 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium`，79 passed。
- GREEN：`npm run test:unit:coverage`，105 files / 736 tests passed，lines 83.47%，`ScheduleBoard.vue` lines 77.66%。

## 范围
- 继续精品化现有排产批量对比采纳路径，不新增业务范围。
- 15 天灰度观察按 owner 指令跳过/延期，不作为当前阻塞项。
