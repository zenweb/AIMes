# 2026-06-14 TODO - 多目标对比换型分钟摘要不一致 Fail-Loud 后续

## 下一步
- 继续按“精品现有功能优先”深挖排产关键路径，不扩新功能。
- 可继续检查 `ParetoCompare.vue` 的指标一致性：顶层 `utilizationRate` 与 `plan.overallUtilizationRate` 是否一致、顶层 `onTimeDeliveryRate` 与 `plan.onTimeDeliveryRate` 是否一致。
- 保持真实 Chromium 证据为每个用户关键路径切片的完成门槛。

## 验证基线
- 当前 `pareto-compare.test.ts`：30 passed。
- 当前 `scheduling.spec.ts` Chromium：76 passed。
- 当前前端 unit coverage：105 files / 732 tests passed，lines 83.45%。
- `ParetoCompare.vue` 当前行覆盖率 93.81%。

## 非当前阻塞
- 15 天灰度观察已跳过/延期。
- 安全项不优先于当前现有排产功能深度打磨，除非直接阻断排产证据。
