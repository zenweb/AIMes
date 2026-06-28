# 2026-06-14 Review - 多目标对比后端失败 Fail-Loud

## 结论
- 当前切片未发现新增阻塞问题。
- 真实后端批量优化对比失败时，不再把演示方案伪装成可采用的正式推荐。
- 明确离线演示错误仍走 demo 推荐，避免破坏演示模式。

## 关注点
- 旧行为会在真实 503 / 网络失败时展示 `综合平衡` 演示推荐，调度员可能误采纳一个并非后端计算出的方案。
- 本轮只改失败分支；正常 `optimize-compare`、方案采用、反馈同步失败路径保持原行为。
- 完整 Chromium 排产套件退出码为 0，但 `批量方案反馈同步失败...` 首跑曾 flaky、retry 通过；随后 focused 复跑该用例通过。
- 工作树存在大量历史改动，本轮未回滚或整理无关内容。

## 已验证
- `pareto-compare.test.ts`：3 passed。
- `scheduling.spec.ts --project=chromium -g "多目标对比后端失败"`：1 passed。
- `scheduling.spec.ts --project=chromium`：49 passed，含 1 个 retry 通过的 flaky。
- `scheduling.spec.ts --project=chromium -g "批量方案反馈同步失败"`：1 passed。
- `test:unit:coverage`：105 files / 705 tests passed，lines 83.26%，`ParetoCompare.vue` lines 90.41%。

## 未完成
- 未执行 15 天灰度观察；该项已由 owner 明确跳过/延期。
