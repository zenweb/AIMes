# 2026-06-14 TODO - 多目标方案缺少计划 Fail-Loud 后续

## 下一步
- 继续按覆盖率增量和用户关键路径选择排产深挖切片。
- 可继续检查多目标对比组件自身的异常结果契约，例如 `optimize-compare` 返回空 `items`、缺少推荐目标、单个对比项缺少 `plan`。
- 继续追真实浏览器证据，优先覆盖会产生审计误导或正式排产误判的路径。

## 验证基线
- 当前 `schedule-board.test.ts`：35 passed。
- 当前 `scheduling.spec.ts` Chromium：48 passed。
- 当前前端 unit coverage：105 files / 704 tests passed，lines 83.25%。
- `ScheduleBoard.vue` 当前行覆盖率 77.50%。

## 非当前阻塞
- 15 天灰度观察已跳过/延期。
- 安全项不优先于当前现有排产功能深度打磨，除非直接阻断排产证据。
