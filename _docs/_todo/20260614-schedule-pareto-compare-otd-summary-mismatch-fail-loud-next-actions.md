# 2026-06-14 TODO - 多目标对比准时率摘要不一致 Fail-Loud 后续

## 下一步
- 继续按“精品现有功能优先”深挖排产关键路径，不扩新功能。
- 可继续检查 `ParetoCompare.vue` 的派生指标一致性，例如完工率是否存在后端摘要双来源或需要从计划明细计算。
- 保持真实 Chromium 证据为每个用户关键路径切片的完成门槛。
- 如后续完整 Chromium 再出现反馈同步首跑波动，单独立项处理，不混入 KPI 摘要一致性切片。

## 验证基线
- 当前 `pareto-compare.test.ts`：32 passed。
- 当前 `scheduling.spec.ts` Chromium：78 passed。
- 当前前端 unit coverage：105 files / 734 tests passed，lines 83.46%。
- `ParetoCompare.vue` 当前行覆盖率 93.93%。

## 非当前阻塞
- 15 天灰度观察已跳过/延期。
- 安全项不优先于当前现有排产功能深度打磨，除非直接阻断排产证据。
