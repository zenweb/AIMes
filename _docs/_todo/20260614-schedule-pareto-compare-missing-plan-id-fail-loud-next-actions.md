# 2026-06-14 TODO - 多目标对比排产计划标识缺失 Fail-Loud 后续

## 下一步
- 继续按“精品现有功能”原则深挖排产多目标对比，不扩新功能。
- 可继续检查 `bestOverallObjective` 为空时的产品语义：允许无推荐但可手选，还是必须由后端明确返回推荐。
- 可继续检查 `objective` 是否属于已知目标集合；当前只要求非空和唯一，但未知目标会落到灰色 badge。
- 对多目标对比采用前契约保持 fail-loud 策略：方案身份不足以支撑反馈和审计时，不展示推荐和采用入口。

## 验证基线
- 当前 `pareto-compare.test.ts`：26 passed。
- 当前 `scheduling.spec.ts` Chromium：72 passed。
- 当前前端 unit coverage：105 files / 728 tests passed，lines 83.43%。
- `ParetoCompare.vue` 当前行覆盖率 93.57%。

## 非当前阻塞
- 15 天灰度观察已跳过/延期。
- 安全项不优先于当前现有排产功能深度打磨，除非直接阻断排产证据。
