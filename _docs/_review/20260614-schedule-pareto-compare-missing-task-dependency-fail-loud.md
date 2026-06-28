# 2026-06-14 Review - 多目标对比计划项依赖缺失 Fail-Loud

## 结论
- 当前切片未发现新增阻塞问题。
- 后端返回引用不存在上游任务的对比方案计划项时，页面现在会明确失败，而不是展示可采用方案。
- 该修复继续收紧多目标对比的采用前契约，确保推荐方案具备自洽的任务依赖链。

## 关注点
- 旧行为会把依赖链断裂的方案渲染成推荐卡、雷达图、KPI 表和“采用”按钮。
- 本轮校验计划项依赖引用必须落在同一方案计划明细中；自依赖、循环依赖和摘要时间窗一致性仍可作为后续切片。
- 完整 Chromium 排产套件退出码为 0，本轮 58 个用例全部通过。
- 工作树存在大量历史改动，本轮未回滚或整理无关内容。

## 已验证
- `pareto-compare.test.ts`：12 passed。
- `scheduling.spec.ts --project=chromium -g "依赖不存在"`：1 passed。
- `scheduling.spec.ts --project=chromium`：58 passed。
- `test:unit:coverage`：105 files / 714 tests passed，lines 83.30%，`ParetoCompare.vue` lines 91.57%。

## 未完成
- 未执行 15 天灰度观察；该项已由 owner 明确跳过/延期。
