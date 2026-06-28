# 2026-06-14 TODO - 排产优化缺少计划 Fail-Loud 后续

## 下一步
- 继续按覆盖率增量和用户关键路径选择排产深挖切片。
- 优先检查 `ScheduleBoard.vue` 中仍可能静默返回或仅 console 记录的用户动作路径。
- 可继续追排产优化后的 readback、采纳后刷新、批量动作失败聚合等真实浏览器证据。

## 验证基线
- 当前 `schedule-board.test.ts`：34 passed。
- 当前 `scheduling.spec.ts` Chromium：47 passed。
- 当前前端 unit coverage：105 files / 703 tests passed，lines 83.23%。
- `ScheduleBoard.vue` 当前行覆盖率 77.21%。

## 非当前阻塞
- 15 天灰度观察已跳过/延期。
- 安全项不优先于当前现有排产功能深度打磨，除非直接阻断排产证据。
