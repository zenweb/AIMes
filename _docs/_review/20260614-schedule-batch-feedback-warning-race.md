# 2026-06-14 Review - 批量方案采纳提示竞态修复

## 结论
- 当前切片未发现新增阻塞问题。
- 迟到的初始排产加载现在不会覆盖用户已经采纳的批量对比方案状态。
- 完整 scheduling Chromium 本轮 79/79 passed，无 retry，上一片暴露的 feedback warning flaky 已被复现并收敛。

## 根因
- `onMounted` 会先执行启动约束读取，再启动 `loadData()`。
- 用户可在 `loadData()` 完成前采纳批量对比方案。
- 旧逻辑中，迟到的 `loadData` 失败分支会执行 `applyDemoSchedule()` 并覆盖 `warnings.value`，把 `综合平衡方案已应用` 替换成离线演示告警。

## 已验证
- `npm run test:unit -- tests/unit/schedule-board.test.ts -t "keeps the applied compared plan warning"`：1 passed。
- `npm run test:unit -- tests/unit/schedule-board.test.ts -t "announces batch objective feedback sync failures"`：1 passed。
- `npm run test:unit -- tests/unit/schedule-board.test.ts`：36 passed。
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "批量方案反馈同步失败"`：1 passed。
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium`：79 passed，无 retry。
- `npm run test:unit:coverage`：105 files / 736 tests passed，lines 83.47%，`ScheduleBoard.vue` lines 77.63%。

## 未完成
- 未执行 15 天灰度观察；该项已由 owner 明确跳过/延期。
- 未处理其他模块覆盖率提升；当前切片只收敛排产批量采纳状态竞态。
