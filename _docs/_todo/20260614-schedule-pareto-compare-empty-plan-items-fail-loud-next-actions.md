# 2026-06-14 TODO - 多目标对比计划明细为空 Fail-Loud 后续

## 下一步
- 继续按“覆盖率增量 × 用户关键路径”选择排产深挖切片。
- 可继续检查 `ParetoCompare.vue` 的响应契约：计划项缺 `plannedStartTime` / `plannedEndTime`、计划项缺 `equipmentId`、计划摘要时间窗与明细时间窗不一致。
- 对 `批量方案反馈同步失败...` 首跑 flaky 保持跟踪；当前 retry 通过，未作为本片阻塞。

## 验证基线
- 当前 `pareto-compare.test.ts`：7 passed。
- 当前 `scheduling.spec.ts` Chromium：53 tests passed with 1 existing flaky retried successfully。
- 当前前端 unit coverage：105 files / 709 tests passed，lines 83.27%。
- `ParetoCompare.vue` 当前行覆盖率 90.85%。

## 非当前阻塞
- 15 天灰度观察已跳过/延期。
- 安全项不优先于当前现有排产功能深度打磨，除非直接阻断排产证据。
