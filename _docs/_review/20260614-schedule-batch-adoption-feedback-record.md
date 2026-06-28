# 2026-06-14 Review - 批量对比采纳反馈记录

## 结论
- 当前切片未发现新增阻塞问题。
- 批量对比“采用此方案”现在会进入最近反馈记录，用户不需要跨 toolbar / warnings / sync-note 推断采纳动作是否被复盘。
- 该修复提升了排产采纳后状态可信度和审计可读性。

## 关注点
- 本轮只沉淀本地 `latestFeedback`；正式后台同步仍由原 `submitAdoptionFeedback` 路径负责。
- 同步失败时继续 fail-loud 显示原因，并保留本地复盘记录。
- 工作树存在大量历史改动，本轮未回滚或整理无关内容。

## 已验证
- `npm run test:unit -- tests/unit/schedule-board.test.ts -t "announces batch objective feedback sync failures"`：1 passed。
- `npm run test:unit -- tests/unit/schedule-board.test.ts -t "keeps the applied compared plan warning"`：1 passed。
- `npm run test:unit -- tests/unit/schedule-board.test.ts`：36 passed。
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "批量方案反馈同步失败"`：1 passed。
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium`：79 passed。
- `npm run test:unit:coverage`：105 files / 736 tests passed，lines 83.47%，`ScheduleBoard.vue` lines 77.66%。

## 未完成
- 未执行 15 天灰度观察；该项已由 owner 明确跳过/延期。
- 未把批量采纳反馈持久化到本地 snapshot；当前切片只修复页面最近反馈可见性。
