# 2026-06-14 TODO - 多目标对比排产计划标识重复 Fail-Loud 后续

## 下一步
- 继续按“精品现有功能”原则深挖排产多目标对比，不扩新功能。
- 可继续检查 `bestOverallObjective` 合法性：为空或指向空字符串时，需要明确是允许无推荐，还是必须 fail-loud。
- 可继续检查 `plan.id` 是否为空：当前重复 ID 已拦截，但空 ID 的错误文案仍可更业务化。
- 对多目标对比采用前契约保持 fail-loud 策略：方案身份不唯一时，不展示推荐和采用入口。

## 验证基线
- 当前 `pareto-compare.test.ts`：25 passed。
- 当前 `scheduling.spec.ts` Chromium：71 passed。
- 当前前端 unit coverage：105 files / 727 tests passed，lines 83.42%。
- `ParetoCompare.vue` 当前行覆盖率 93.5%。

## 非当前阻塞
- 15 天灰度观察已跳过/延期。
- 安全项不优先于当前现有排产功能深度打磨，除非直接阻断排产证据。
