# 2026-06-14 Plan - 批量方案反馈 Warning 竞态复查

## 成功标准
- 证明当前已知 `.warnings-bar` 竞态是否仍可复现。
- 若可复现，先补失败用例再修；若不可复现，记录证据并停止猜测式修复。
- 不扩大排产多目标对比范围。

## 执行
- 阅读 `ScheduleBoard.vue` warning 聚合、`handleOptimize`、`loadData` 与 `scheduleStateVersion` 逻辑。
- 阅读 `schedule-board.test.ts` 中批量方案反馈同步失败和晚到初始加载失败用例。
- 跑定向单测与真实 Chromium，并额外连跑 3 次真实 Chromium 用例。

## 停止条件
- 当前定向证据全部通过，且没有新的失败 trace。
- 本片仅记录复查与验证，不修改生产逻辑。
