# 2026-06-14 排产批量采纳刷新回读

## 变更
- 排产页启动时从本地 `aimes_schedule_feedback_snapshot` 恢复最近采纳反馈。
- 批量对比采纳后刷新页面，调度员仍能看到 `已采纳批量对比方案`、`批量对比采纳`、目标和原因。
- 扩展真实 Chromium 用例，验证批量方案反馈同步失败时本地目标切换不仅写入 snapshot，也能在页面 reload 后回显。

## 验证
- RED：`npm run test:unit -- tests/unit/schedule-board.test.ts -t "restores the local batch adoption feedback snapshot"`，刷新回读缺失。
- GREEN：同一目标单测通过。
- GREEN：`npm run test:unit -- tests/unit/schedule-board.test.ts`，37 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "批量方案反馈同步失败"`，1 passed。
- GREEN：`npm run test:unit -- tests/unit/schedule-feedback-sync.test.ts`，4 passed。
- GREEN：`npm run test:unit:coverage`，105 files / 739 tests passed，lines 83.5%，`ScheduleBoard.vue` lines 77.88%。

## 范围
- 精品化现有排产批量采纳证据链，不新增功能范围。
- 15 天灰度观察按 owner 指令跳过/延期，不作为当前阻塞项。
