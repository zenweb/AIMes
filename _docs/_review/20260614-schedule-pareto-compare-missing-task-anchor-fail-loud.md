# 2026-06-14 Review - 多目标对比计划项锚点缺失 Fail-Loud

## 结论
- 当前切片未发现新增阻塞问题。
- 后端返回缺少 `workOrderId` 或 `equipmentId` 的对比方案计划项时，页面现在会明确失败，而不是展示可采用方案。
- 该修复继续收紧多目标对比的采用前契约，确保推荐方案具备工单和设备两个落地锚点。

## 关注点
- 旧行为会把缺设备锚点的方案渲染成推荐卡、雷达图、KPI 表和“采用”按钮。
- 本轮校验计划项具备工单/设备锚点；计划项 `id`、`workOrderNumber` 或计划摘要窗口与明细窗口一致性仍可作为后续切片。
- 完整 Chromium 排产套件退出码为 0，本轮 56 个用例全部一次通过。
- 工作树存在大量历史改动，本轮未回滚或整理无关内容。

## 已验证
- `pareto-compare.test.ts`：10 passed。
- `scheduling.spec.ts --project=chromium -g "缺少工单或设备锚点"`：1 passed。
- `scheduling.spec.ts --project=chromium`：56 passed。
- `test:unit:coverage`：105 files / 712 tests passed，lines 83.29%，`ParetoCompare.vue` lines 91.30%。

## 未完成
- 未执行 15 天灰度观察；该项已由 owner 明确跳过/延期。
