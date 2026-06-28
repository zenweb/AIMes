# 2026-06-14 TODO - 排产 Assistant 恢复闭环本地保存 Fail-Loud 后续

## 下一步
- 继续按覆盖率增量和用户关键路径选择排产深挖切片。
- 可优先检查 `ScheduleBoard.vue` 中 risk reload、formal writeback、adoption feedback 的剩余用户可见失败路径。
- 避免继续精修已充分覆盖的登录页；当前更高杠杆仍在排产主路径和低覆盖核心组件。

## 验证基线
- 当前 `schedule-board.test.ts`：31 passed。
- 当前 `scheduling.spec.ts` Chromium：44 passed。
- 当前前端 unit coverage：105 files / 700 tests passed，lines 83.25%。
- `ScheduleBoard.vue` 当前行覆盖率 77.34%。

## 非当前阻塞
- 15 天灰度观察已跳过/延期。
- 安全项不优先于当前现有排产功能深度打磨，除非直接阻断排产证据。
