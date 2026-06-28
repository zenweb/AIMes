# 2026-06-14 Review - 多目标对比依赖时间顺序 Fail-Loud

## 结论
- 当前切片未发现新增阻塞问题。
- 后端返回依赖任务尚未完成、下游任务已开始的对比方案时，页面现在会明确失败，而不是展示可采用方案。
- 该修复继续收紧多目标对比的采用前契约，确保推荐方案的依赖链时间顺序可执行。

## 关注点
- 旧行为会把 A 任务 08:00-12:00、B 任务依赖 A 但 10:00 开始的方案渲染成推荐卡、KPI 表和“采用”按钮。
- 本轮校验依赖已有前置检查：任务身份存在、依赖目标存在、时间窗有效、无自依赖、无循环依赖。
- 首次完整相关套件暴露出校验顺序问题：时间顺序错误覆盖了自依赖/循环依赖的更具体错误；已将自依赖和循环依赖校验前置。
- 工作树存在大量历史改动，本轮未回滚或整理无关内容。

## 已验证
- `pareto-compare.test.ts`：17 passed。
- `scheduling.spec.ts --project=chromium -g "依赖时间顺序"`：1 passed。
- `scheduling.spec.ts --project=chromium`：63 passed。
- `test:unit:coverage`：105 files / 719 tests passed，lines 83.37%，`ParetoCompare.vue` lines 92.68%。
- 敏感信息扫描 touched files：exit code 1。

## 未完成
- 未执行 15 天灰度观察；该项已由 owner 明确跳过/延期。
