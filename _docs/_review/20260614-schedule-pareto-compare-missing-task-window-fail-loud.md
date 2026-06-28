# 2026-06-14 Review - 多目标对比计划项时间窗缺失 Fail-Loud

## 结论
- 当前切片未发现新增阻塞问题。
- 后端返回缺少 `plannedStartTime` 或 `plannedEndTime` 的对比方案计划项时，页面现在会明确失败，而不是展示可采用方案。
- 该修复继续收紧多目标对比的采用前契约，确保推荐方案具备任务级排产窗口。

## 关注点
- 旧行为会把缺少任务开始或结束时间的方案渲染成推荐卡、雷达图、KPI 表和“采用”按钮。
- 本轮只校验时间窗字段存在；时间字符串是否可解析、结束时间是否晚于开始时间仍是后续切片。
- 完整 Chromium 排产套件退出码为 0，本轮 54 个用例全部一次通过。
- 工作树存在大量历史改动，本轮未回滚或整理无关内容。

## 已验证
- `pareto-compare.test.ts`：8 passed。
- `scheduling.spec.ts --project=chromium -g "计划项缺少时间窗"`：1 passed。
- `scheduling.spec.ts --project=chromium`：54 passed。
- `test:unit:coverage`：105 files / 710 tests passed，lines 83.28%，`ParetoCompare.vue` lines 90.96%。

## 未完成
- 未执行 15 天灰度观察；该项已由 owner 明确跳过/延期。
