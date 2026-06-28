# 2026-06-14 TODO - 多目标对比目标标识重复 Fail-Loud 后续

## 下一步
- 继续按“精品现有功能”原则深挖排产多目标对比，不扩新功能。
- 可继续检查重复 `plan.id`：如果不同 `objective` 指向同一个 plan id，采用、反馈和审计链路可能出现方案身份歧义。
- 可继续检查 `bestOverallObjective` 合法性：为空或指向不存在目标时，需要明确是允许无推荐，还是必须 fail-loud。
- 对多目标对比采用前契约保持 fail-loud 策略：目标身份不唯一时，不展示推荐和采用入口。

## 验证基线
- 当前 `pareto-compare.test.ts`：24 passed。
- 当前 `scheduling.spec.ts` Chromium：exit code 0，69 passed，1 flaky；既有 flaky 窄跑复测 1 passed。
- 当前前端 unit coverage：105 files / 726 tests passed，lines 83.42%。
- `ParetoCompare.vue` 当前行覆盖率 93.43%。

## 非当前阻塞
- 15 天灰度观察已跳过/延期。
- 安全项不优先于当前现有排产功能深度打磨，除非直接阻断排产证据。
