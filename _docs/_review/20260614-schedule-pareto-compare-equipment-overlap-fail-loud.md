# 2026-06-14 Review - 多目标对比同设备时间重叠 Fail-Loud

## 结论
- 当前切片未发现新增阻塞问题。
- 后端返回同设备计划项时间重叠的对比方案时，页面现在会明确失败，而不是展示可采用方案。
- 该修复继续收紧多目标对比的采用前契约，确保推荐方案不会把同一设备排进互相冲突的时间窗口。

## 关注点
- 旧行为会把同一设备 08:00-12:00 与 10:00-14:00 的计划渲染成推荐卡、KPI 表和“采用”按钮。
- 本轮重叠检测依赖前置时间窗校验已保证计划项起止时间可解析且结束晚于开始。
- 完整 Chromium 排产套件退出码为 0，本轮 62 个用例全部通过。
- 工作树存在大量历史改动，本轮未回滚或整理无关内容。

## 已验证
- `pareto-compare.test.ts`：16 passed。
- `scheduling.spec.ts --project=chromium -g "时间重叠"`：1 passed。
- `scheduling.spec.ts --project=chromium`：62 passed。
- `test:unit:coverage`：105 files / 718 tests passed，lines 83.32%，`ParetoCompare.vue` lines 91.06%。
- 敏感信息扫描 touched files：exit code 1。

## 未完成
- 未执行 15 天灰度观察；该项已由 owner 明确跳过/延期。
