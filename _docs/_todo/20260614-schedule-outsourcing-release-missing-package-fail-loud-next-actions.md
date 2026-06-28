# 2026-06-14 TODO - 排产外协释放缺失承诺包 Fail-Loud 后续

## 下一步
- 继续按覆盖率增量和用户关键路径选择排产深挖切片。
- 可优先检查 `ScheduleBoard.vue` 中 adoption、risk reload、formal writeback 剩余空返回或异步失败分支。
- 若继续强化反馈承载，再评估把 `feedbackSyncNote` 升级为结构化消息列表；当前先保持最小改动。

## 验证基线
- 当前 `schedule-board.test.ts`：32 passed。
- 当前 `scheduling.spec.ts` Chromium：45 passed。
- 当前前端 unit coverage：105 files / 701 tests passed，lines 83.25%。
- `ScheduleBoard.vue` 当前行覆盖率 77.41%。

## 非当前阻塞
- 15 天灰度观察已跳过/延期。
- 安全项不优先于当前现有排产功能深度打磨，除非直接阻断排产证据。
