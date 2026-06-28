# 2026-06-14 TODO - 多目标对比计划项身份缺失 Fail-Loud 后续

## 下一步
- 继续按“覆盖率增量 × 用户关键路径”选择排产深挖切片。
- 可继续检查 `ParetoCompare.vue` 的响应契约：计划摘要时间窗与明细时间窗不一致、`dependentItems` 指向不存在任务、或方案指标与计划明细矛盾。
- 对多目标对比采用前契约保持 fail-loud 策略：数据不足以落地排产时，不展示推荐和采用入口。

## 验证基线
- 当前 `pareto-compare.test.ts`：11 passed。
- 当前 `scheduling.spec.ts` Chromium：57 passed。
- 当前前端 unit coverage：105 files / 713 tests passed，lines 83.29%。
- `ParetoCompare.vue` 当前行覆盖率 91.39%。

## 非当前阻塞
- 15 天灰度观察已跳过/延期。
- 安全项不优先于当前现有排产功能深度打磨，除非直接阻断排产证据。
