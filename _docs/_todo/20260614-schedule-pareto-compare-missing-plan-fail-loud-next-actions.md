# 2026-06-14 TODO - 多目标对比缺少排产计划 Fail-Loud 后续

## 下一步
- 继续按“覆盖率增量 × 用户关键路径”选择排产深挖切片。
- 可继续检查 `ParetoCompare.vue` 的响应契约：`plan.items` 为空但 `totalWorkOrders > 0`、`plan.items` 无可渲染时间窗、单个方案指标与计划摘要不一致。
- 如果继续做多目标对比，优先补“可采用方案必须完整可落地”的校验，而不是扩展新功能。

## 验证基线
- 当前 `pareto-compare.test.ts`：6 passed。
- 当前 `scheduling.spec.ts` Chromium：52 passed。
- 当前前端 unit coverage：105 files / 708 tests passed，lines 83.27%。
- `ParetoCompare.vue` 当前行覆盖率 90.75%。

## 非当前阻塞
- 15 天灰度观察已跳过/延期。
- 安全项不优先于当前现有排产功能深度打磨，除非直接阻断排产证据。
