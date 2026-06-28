# 2026-06-14 Review - 多目标对比同设备顺序时间 Fail-Loud

## 结论
- 当前切片未发现新增阻塞问题。
- 后端返回同设备 `sequence` 与时间顺序反向的对比方案时，页面现在会明确失败，而不是展示可采用方案。
- 该修复继续收紧多目标对比的采用前契约，确保同设备排产不仅时间不重叠，而且执行顺序语义一致。

## 关注点
- 旧行为会把同设备 sequence=2 的任务排在 08:00-12:00、sequence=1 的任务排在 12:00-16:00 的方案渲染成推荐卡、KPI 表和“采用”按钮。
- 本轮校验依赖已有前置检查：任务身份存在、设备锚点存在、时间窗有效、同设备时间不重叠。
- 完整 Chromium 排产套件退出码为 0，本轮 64 个用例全部通过。
- 工作树存在大量历史改动，本轮未回滚或整理无关内容。

## 已验证
- `pareto-compare.test.ts`：18 passed。
- `scheduling.spec.ts --project=chromium -g "顺序与时间不一致"`：1 passed。
- `scheduling.spec.ts --project=chromium`：64 passed。
- `test:unit:coverage`：105 files / 720 tests passed，lines 83.39%，`ParetoCompare.vue` lines 92.99%。
- 敏感信息扫描 touched files：exit code 1。

## 未完成
- 未执行 15 天灰度观察；该项已由 owner 明确跳过/延期。
