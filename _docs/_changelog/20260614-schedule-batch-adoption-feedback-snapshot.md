# 2026-06-14 批量对比采纳 feedback snapshot 持久化

## 变更
- `ScheduleBoard.vue` 在批量对比方案成功采纳后，除了更新 `latestFeedback`，同步调用 `writeScheduleFeedbackSnapshot`。
- 本地 snapshot 现在会写入 `aimes_schedule_feedback_snapshot`，并带上 `TRACE-SCH-FEEDBACK-BATCH-balanced` 这一类批量采纳 traceId。
- snapshot 由既有 `schedule-feedback-sync` 统一补齐 `source: local`，继续进入 OTD evidence chain 记录路径。
- 补充单测和 Chromium 真实浏览器断言，覆盖批量对比采纳后的本地持久化证据。

## 验证
- RED：`npm run test:unit -- tests/unit/schedule-board.test.ts -t "announces batch objective feedback sync failures"` 曾失败，旧逻辑 `writeScheduleFeedbackSnapshot` calls 为 0。
- GREEN：`npm run test:unit -- tests/unit/schedule-board.test.ts -t "announces batch objective feedback sync failures"`，1 passed。
- GREEN：`npm run test:unit -- tests/unit/schedule-feedback-sync.test.ts`，4 passed。
- GREEN：`npm run test:unit -- tests/unit/schedule-board.test.ts`，36 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "批量方案反馈同步失败"`，1 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium`，79 passed。
- GREEN：`npm run test:unit:coverage`，105 files / 736 tests passed，lines 83.47%，`ScheduleBoard.vue` lines 77.74%。

## 范围
- 继续精品化现有排产批量对比采纳路径，不新增业务范围。
- 15 天灰度观察按 owner 指令跳过/延期，不作为当前阻塞项。
