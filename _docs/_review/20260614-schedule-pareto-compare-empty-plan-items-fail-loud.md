# 2026-06-14 Review - 多目标对比计划明细为空 Fail-Loud

## 结论
- 当前切片未发现新增阻塞问题。
- 后端声称对比方案有工单但 `plan.items` 为空时，页面现在会明确失败，而不是展示可采用方案。
- 该修复继续收紧多目标对比的采用前契约，确保 KPI 摘要和计划明细一致。

## 关注点
- 旧行为会把 `totalWorkOrders: 1`、`plan.items: []` 的矛盾方案渲染成推荐卡、雷达图、KPI 表和“采用”按钮。
- 本轮只校验“有工单但无计划明细”；计划项时间窗缺失仍是后续切片。
- 完整 Chromium 排产套件退出码为 0，但 `批量方案反馈同步失败...` 首跑 flaky、retry 通过；失败点仍是 `.warnings-bar` 的演示 fallback 文案与“综合平衡方案已应用”提示竞争。
- 工作树存在大量历史改动，本轮未回滚或整理无关内容。

## 已验证
- `pareto-compare.test.ts`：7 passed。
- `scheduling.spec.ts --project=chromium -g "计划明细为空"`：1 passed。
- `scheduling.spec.ts --project=chromium`：53 tests passed with 1 existing flaky retried successfully。
- `test:unit:coverage`：105 files / 709 tests passed，lines 83.27%，`ParetoCompare.vue` lines 90.85%。

## 未完成
- 未执行 15 天灰度观察；该项已由 owner 明确跳过/延期。
