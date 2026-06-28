# 2026-06-14 TODO - 排产拖拽缺少计划 ID Fail-Loud 后续

## 下一步
- 继续按覆盖率增量和用户关键路径选择排产深挖切片。
- 可继续检查 `ScheduleBoard.vue` 中任务不存在、采纳后风险刷新失败、批量优化触发失败等剩余边界。
- 如果继续追拖拽写回证据，可补“任务 ID 不存在”的真实浏览器路径；当前已覆盖计划 ID 缺失这一正式数据异常。

## 验证基线
- 当前 `schedule-board.test.ts`：33 passed。
- 当前 `scheduling.spec.ts` Chromium：46 passed。
- 当前前端 unit coverage：105 files / 702 tests passed，lines 83.23%。
- `ScheduleBoard.vue` 当前行覆盖率 77.18%。

## 非当前阻塞
- 15 天灰度观察已跳过/延期。
- 安全项不优先于当前现有排产功能深度打磨，除非直接阻断排产证据。
