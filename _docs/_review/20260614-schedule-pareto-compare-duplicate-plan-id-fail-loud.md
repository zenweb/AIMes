# 2026-06-14 Review - 多目标对比排产计划标识重复 Fail-Loud

## 结论
- 当前切片未发现新增阻塞问题。
- 后端返回重复 `plan.id` 时，页面现在会明确失败，而不是展示可采用的多目标对比方案。
- 该修复继续收紧多目标对比的采用前契约，确保每个可比较目标不仅目标标识唯一，背后的排产计划身份也唯一。

## 关注点
- 旧行为允许 `due_date` 与 `balanced` 等不同目标复用同一个 `plan.id`。
- 由于采用链路对外 emit 的是 `objective`，但后续优化、反馈和审计语义需要落到具体排产计划，重复 `plan.id` 会让“采用了哪个方案”不可追溯。
- 本轮只加入计划 ID 唯一性校验，没有调整推荐排序、图表渲染或采用 API。
- 工作树存在大量历史改动，本轮未回滚或整理无关内容。

## 已验证
- `pareto-compare.test.ts -t "same plan id"`：1 passed。
- `scheduling.spec.ts --project=chromium -g "排产计划标识重复"`：1 passed。
- `pareto-compare.test.ts`：25 passed。
- `scheduling.spec.ts --project=chromium`：71 passed。
- `test:unit:coverage`：105 files / 727 tests passed，lines 83.42%，`ParetoCompare.vue` lines 93.5%。

## 未完成
- 未执行 15 天灰度观察；该项已由 owner 明确跳过/延期。
