# 2026-06-14 Review - 多目标对比缺少排产计划 Fail-Loud

## 结论
- 当前切片未发现新增阻塞问题。
- 后端只返回对比指标但缺少可落地 `plan` 时，页面现在会明确失败，而不是展示可采用方案。
- 该修复继续收紧多目标对比的采用前契约，确保每个可展示方案都能追溯到排产计划载荷。

## 关注点
- 旧行为会把缺 `plan` 的对比项渲染成推荐卡、雷达图、KPI 表和“采用”按钮。
- 本轮只校验 `plan` 存在且 `plan.items` 是数组；`plan.items` 为空但指标声称有工单仍是后续切片。
- 完整 Chromium 排产套件本轮 52 passed，无 retry。
- 工作树存在大量历史改动，本轮未回滚或整理无关内容。

## 已验证
- `pareto-compare.test.ts`：6 passed。
- `scheduling.spec.ts --project=chromium -g "缺少排产计划时真实浏览器展示 fail-loud"`：1 passed。
- `scheduling.spec.ts --project=chromium`：52 passed。
- `test:unit:coverage`：105 files / 708 tests passed，lines 83.27%，`ParetoCompare.vue` lines 90.75%。

## 未完成
- 未执行 15 天灰度观察；该项已由 owner 明确跳过/延期。
