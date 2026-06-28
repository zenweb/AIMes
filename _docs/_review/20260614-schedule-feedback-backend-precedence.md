# 2026-06-14 Review - 排产反馈后端优先回读

## 结论
- 当前切片未发现新增阻塞问题。
- 排产页最近反馈回读规则已明确：后端正式反馈优先，本地 snapshot 仅作为兜底。
- 单测和真实 Chromium 均覆盖后端优先与本地兜底，避免旧本地批量采纳记录覆盖后台同步结果。

## 关注点
- `getLatestAdoptionFeedback()` 当前内部吞掉接口错误并返回 null，因此后端异常会自然回退本地 snapshot；这符合本轮“不阻断排产主数据”的目标。
- 覆盖率总行数从上一片 83.5% 小幅波动到 83.47%，但目标行为由专门测试和 Chromium 证据覆盖。
- 工作树已有大量历史改动，本轮未回滚无关内容。

## 已验证
- `npm run test:unit -- tests/unit/schedule-board.test.ts`：38 passed。
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "批量方案反馈同步失败"`：1 passed。
- `npm run test:unit:coverage`：105 files / 740 tests passed，lines 83.47%，`ScheduleBoard.vue` lines 77.88%。

## 未完成
- 未执行完整 `scheduling.spec.ts` 全量 Chromium；本轮执行目标真实浏览器用例和完整前端覆盖率。
