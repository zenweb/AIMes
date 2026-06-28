# 2026-06-14 TODO - 排产 Assistant 恢复交接闭环刷新 Fail-Loud 后续

## 下一步
- 继续按“覆盖率增量 × 用户关键路径”选择排产相关低覆盖切片。
- 优先关注 `ScheduleBoard.vue` 未覆盖的闭环异常分支与用户可见提示，而不是回到已高覆盖登录页。
- 如继续排产深挖，建议选择刷新后读回、正式排产写回、事件队列闭环中的低覆盖分支。

## 验证基线
- 当前 `scheduling.spec.ts` Chromium 已全绿：43 passed。
- 当前前端 unit coverage 已全绿：105 files / 696 tests passed。
- `ScheduleBoard.vue` 当前行覆盖率 77.14%，仍有提升空间。

## 非当前阻塞
- 15 天灰度观察已跳过/延期。
- 安全项不优先于当前现有排产功能深度打磨，除非直接阻断排产证据。
