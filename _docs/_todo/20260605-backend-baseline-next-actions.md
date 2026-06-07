# 2026-06-05 Backend Baseline Next Actions

## Done

- 已完成：后端 Unit 基线刷新，`430 passed / 0 failed / 0 skipped`。
- 已完成：定位 Integration 超时根因：排产优化测试环境走真实 LLM。
- 已完成：`TestWebApplicationFactory` 注入 deterministic `IScheduleOptimizationService` fake。
- 已完成：完整 Integration 验证，`174 passed / 0 failed / 0 skipped`。
- 已完成：Evaluation 独立验证，`2 passed / 0 failed / 0 skipped`。
- 已完成：Architecture 独立验证，`85 passed / 0 failed / 0 skipped`。

## Continue

- 继续：运行 scoped diff check / whitespace check，确认测试工厂和文档无格式问题。
- 继续：前端已多轮 coverage/lint 通过；下一步若继续 A-track，按覆盖率杠杆选发布证据链或用户必经路径。

## B-track

- 仍需真实 GitHub Actions run、staging rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察证据。
- 已确认：`gh` 登录可用；仍缺 GitHub repo/remote 绑定，当前 `origin` 指向腾讯工蜂。
