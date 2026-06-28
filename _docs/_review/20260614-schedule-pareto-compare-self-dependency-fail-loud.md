# 2026-06-14 Review - 多目标对比计划项自依赖 Fail-Loud

## 结论
- 当前切片未发现新增阻塞问题。
- 后端返回计划项依赖自身的对比方案时，页面现在会明确失败，而不是展示可采用方案。
- 该修复继续收紧多目标对比的采用前契约，确保推荐方案不会携带无效执行拓扑。

## 关注点
- 旧行为会把自依赖方案渲染成推荐卡、雷达图、KPI 表和“采用”按钮。
- 本轮校验单点自依赖；多节点循环依赖和摘要时间窗一致性仍可作为后续切片。
- 完整 Chromium 排产套件退出码为 0，本轮 59 个用例全部通过。
- 工作树存在大量历史改动，本轮未回滚或整理无关内容。

## 已验证
- `pareto-compare.test.ts`：13 passed。
- `scheduling.spec.ts --project=chromium -g "自依赖"`：1 passed。
- `scheduling.spec.ts --project=chromium`：59 passed。
- `test:unit:coverage`：105 files / 715 tests passed，lines 83.30%，`ParetoCompare.vue` lines 91.66%。

## 未完成
- 未执行 15 天灰度观察；该项已由 owner 明确跳过/延期。
