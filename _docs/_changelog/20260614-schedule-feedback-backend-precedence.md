# 2026-06-14 排产反馈后端优先回读

## 变更
- 排产页刷新恢复最近反馈时，先读取后端 `/scheduling/adoption-feedback/latest`，无后端记录时再回退本地 `aimes_schedule_feedback_snapshot`。
- 补充单测，锁定“后端正式反馈优先于旧本地批量采纳 snapshot”的行为。
- 扩展真实 Chromium 批量采纳用例，验证本地兜底回显后，再模拟后端最新反馈并 reload，页面显示后端正式采纳。

## 验证
- RED：`npm run test:unit -- tests/unit/schedule-board.test.ts -t "prefers backend latest feedback"`，旧逻辑显示本地 snapshot。
- GREEN：同一目标单测通过。
- GREEN：`npm run test:unit -- tests/unit/schedule-board.test.ts`，38 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "批量方案反馈同步失败"`，1 passed。
- GREEN：`npm run test:unit:coverage`，105 files / 740 tests passed，lines 83.47%，`ScheduleBoard.vue` lines 77.88%。

## 范围
- 精品化现有排产反馈回读优先级，不新增排产功能。
- 15 天灰度观察按 owner 指令跳过/延期，不作为当前阻塞项。
