# 2026-06-14 TODO - 多目标对比缺少推荐方案 Fail-Loud 后续

## 下一步
- 继续按“精品现有功能优先”深挖排产关键路径，不扩新功能。
- 可继续检查 `ParetoCompare.vue` 的采用前契约：采纳 emit 是否只允许推荐目标或当前有效方案、前端指标归一化是否会误导用户、后端 score 和前端推荐说明是否一致。
- 保持真实 Chromium 证据为每个用户关键路径切片的完成门槛。

## 验证基线
- 当前 `pareto-compare.test.ts`：27 passed。
- 当前 `scheduling.spec.ts` Chromium：73 passed。
- 当前前端 unit coverage：105 files / 729 tests passed，lines 83.43%。
- `ParetoCompare.vue` 当前行覆盖率 93.61%。

## 非当前阻塞
- 15 天灰度观察已跳过/延期。
- 安全项不优先于当前现有排产功能深度打磨，除非直接阻断排产证据。
