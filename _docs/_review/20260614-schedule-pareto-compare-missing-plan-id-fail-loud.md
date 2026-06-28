# 2026-06-14 Review - 多目标对比排产计划标识缺失 Fail-Loud

## 结论
- 当前切片未发现新增阻塞问题。
- 后端返回空白 `plan.id` 时，页面现在会明确失败，而不是展示可采用的多目标对比方案。
- 该修复继续收紧多目标对比的采用前契约，确保每个可比较方案都有可用于反馈和审计的排产计划锚点。

## 关注点
- 父级 `ScheduleBoard` 的批量方案采纳反馈会提交 `schedulePlanId: planData.value.id`。
- 如果对比阶段允许空 `plan.id`，用户看到的是可采用方案，但后续“采用了哪个排产计划”的审计身份不完整。
- 本轮只加入计划 ID 缺失校验，没有调整优化、反馈提交或推荐排序。
- 工作树存在大量历史改动，本轮未回滚或整理无关内容。

## 已验证
- `pareto-compare.test.ts -t "missing its plan id"`：1 passed。
- `scheduling.spec.ts --project=chromium -g "缺少排产计划标识"`：1 passed。
- `pareto-compare.test.ts`：26 passed。
- `scheduling.spec.ts --project=chromium`：72 passed。
- `test:unit:coverage`：105 files / 728 tests passed，lines 83.43%，`ParetoCompare.vue` lines 93.57%。

## 未完成
- 未执行 15 天灰度观察；该项已由 owner 明确跳过/延期。
