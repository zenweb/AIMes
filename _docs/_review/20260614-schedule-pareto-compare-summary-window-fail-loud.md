# 2026-06-14 Review - 多目标对比计划摘要时间窗 Fail-Loud

## 结论
- 当前切片未发现新增阻塞问题。
- 后端返回摘要时间窗短于计划明细的对比方案时，页面现在会明确失败，而不是展示可采用方案。
- 该修复继续收紧多目标对比的采用前契约，确保推荐方案的摘要边界和甘特明细一致。

## 关注点
- 旧行为会把计划摘要 08:00-10:00、明细任务 08:00-12:00 的方案渲染成推荐卡、雷达图、KPI 表和“采用”按钮。
- 本轮校验摘要起止时间可解析且覆盖所有计划项；后续仍可检查同设备计划项时间重叠或方案指标与明细矛盾。
- 完整 Chromium 排产套件退出码为 0，本轮 61 个用例全部通过。
- 工作树存在大量历史改动，本轮未回滚或整理无关内容。

## 已验证
- `pareto-compare.test.ts`：15 passed。
- `scheduling.spec.ts --project=chromium -g "摘要时间窗"`：1 passed。
- `scheduling.spec.ts --project=chromium`：61 passed。
- `test:unit:coverage`：105 files / 717 tests passed，lines 83.30%，`ParetoCompare.vue` lines 90.41%。

## 未完成
- 未执行 15 天灰度观察；该项已由 owner 明确跳过/延期。
