# 2026-06-14 Review - 多目标对比目标标识重复 Fail-Loud

## 结论
- 当前切片未发现新增阻塞问题。
- 后端返回重复 `objective` key 时，页面现在会明确失败，而不是渲染重复 active/best 行、重复 tab 或可采用方案。
- 该修复继续收紧多目标对比的采用前契约，确保每个可比较方案都有唯一稳定的目标标识。

## 关注点
- 旧行为允许两个方案同时使用 `objective: 'balanced'`，会导致 UI 同时出现多个 active/best 状态。
- 旧行为还会让 `ganttDataByObjective[item.objective]` 后写覆盖先写，导致目标 tab 与甘特图数据来源不可信。
- 完整 Chromium 排产套件退出码为 0，但报告中有 1 个既有 flaky：`批量方案反馈同步失败时真实浏览器保留本地目标切换并展示原因`；该用例窄跑复测已通过。
- 工作树存在大量历史改动，本轮未回滚或整理无关内容。

## 已验证
- `pareto-compare.test.ts -t "same objective key"`：1 passed。
- `scheduling.spec.ts --project=chromium -g "目标标识重复"`：1 passed。
- `pareto-compare.test.ts`：24 passed。
- `scheduling.spec.ts --project=chromium`：exit code 0，69 passed，1 flaky。
- `scheduling.spec.ts --project=chromium -g "批量方案反馈同步失败"`：1 passed。
- `test:unit:coverage`：105 files / 726 tests passed，lines 83.42%，`ParetoCompare.vue` lines 93.43%。

## 未完成
- 未执行 15 天灰度观察；该项已由 owner 明确跳过/延期。
