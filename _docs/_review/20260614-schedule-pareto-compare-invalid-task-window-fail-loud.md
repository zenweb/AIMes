# 2026-06-14 Review - 多目标对比计划项时间窗无效 Fail-Loud

## 结论
- 当前切片未发现新增阻塞问题。
- 后端返回倒置时间窗或不可解析时间窗的对比方案计划项时，页面现在会明确失败，而不是展示可采用方案。
- 该修复继续收紧多目标对比的采用前契约，确保推荐方案具备可执行的任务级排产窗口。

## 关注点
- 旧行为会把 `plannedEndTime <= plannedStartTime` 的方案渲染成推荐卡、雷达图、KPI 表和“采用”按钮。
- 本轮校验时间字段可解析且结束时间晚于开始时间；计划项缺 `equipmentId` 仍可作为后续切片。
- 完整 Chromium 排产套件退出码为 0，本轮 55 个用例全部一次通过。
- 工作树存在大量历史改动，本轮未回滚或整理无关内容。

## 已验证
- `pareto-compare.test.ts`：9 passed。
- `scheduling.spec.ts --project=chromium -g "时间窗无效"`：1 passed。
- `scheduling.spec.ts --project=chromium`：55 passed。
- `test:unit:coverage`：105 files / 711 tests passed，lines 83.28%，`ParetoCompare.vue` lines 91.20%。

## 未完成
- 未执行 15 天灰度观察；该项已由 owner 明确跳过/延期。
