# 2026-06-14 Review - 多目标对比计划项循环依赖 Fail-Loud

## 结论
- 当前切片未发现新增阻塞问题。
- 后端返回多节点循环依赖的对比方案时，页面现在会明确失败，而不是展示可采用方案。
- 该修复继续收紧多目标对比的采用前契约，确保推荐方案不会携带不可执行的任务依赖图。

## 关注点
- 旧行为会把 A 依赖 B、B 依赖 A 的方案渲染成推荐卡、雷达图、KPI 表和“采用”按钮。
- 本轮新增 DFS 依赖图检测，覆盖任意长度循环；后续仍可检查计划摘要时间窗与明细时间窗一致性。
- 完整 Chromium 排产套件退出码为 0，本轮 60 个用例全部通过。
- 工作树存在大量历史改动，本轮未回滚或整理无关内容。

## 已验证
- `pareto-compare.test.ts`：14 passed。
- `scheduling.spec.ts --project=chromium -g "循环依赖"`：1 passed。
- `scheduling.spec.ts --project=chromium`：60 passed。
- `test:unit:coverage`：105 files / 716 tests passed，lines 83.29%，`ParetoCompare.vue` lines 90.43%。

## 未完成
- 未执行 15 天灰度观察；该项已由 owner 明确跳过/延期。
