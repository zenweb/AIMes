# 2026-06-05 Backend Integration LLM Test Fake Plan

## Success Criteria

- 后端 Unit 测试基线必须有新鲜结果。
- Integration 测试不能依赖真实外部 LLM 才能完成本地 API 合约验证。
- 先复现超时红项，再用最小测试工厂修复恢复 Integration。
- 完成后同步 changelog、review、issue、plan、todo 五类文档。

## A-track

- 已完成：后端 Unit 基线刷新，`430 passed / 0 failed / 0 skipped`。
- 已完成：复现 Integration 超时红项；非 PerformanceTests 初次隔离为 `164 passed / 2 failed`。
- 已完成：修复 `TestWebApplicationFactory`，注入 deterministic `TestScheduleOptimizationService`。
- 已验证：两个红项 `2 passed`。
- 已验证：非 PerformanceTests Integration `166 passed`。
- 已验证：完整 Integration `174 passed`。
- 已验证：Evaluation `2 passed`，Architecture `85 passed`。

## B-track

- Hosted CI、staging rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察仍缺真实外部证据。
- 不用本地测试基线替代发布闸门证据。
- 当前 `gh` 已登录；GitHub repo/remote 仍需用户确认创建或提供。
