# 2026-06-05 Backend Integration LLM Test Fake Changelog

## Sprint 0 Baseline Refresh Slice

- 选片依据：Sprint 0 / 0.0 的测试基线旧证据停留在 2026-05-30，当前工作树已经大幅变化；刷新后端测试基线比继续前端微切片更接近发布就绪目标。
- 初始证据：`dotnet test .\src\tests\MES.Tests.Unit\MES.Tests.Unit.csproj ...` 通过，`430 passed / 0 failed / 0 skipped`。
- 初始红项：完整 Integration 裸跑 5 分钟超时，无 `integration-20260605.trx`；残留 6 个 `dotnet` 测试进程已清理。
- 隔离证据：非 PerformanceTests 子集跑出 `164 passed / 2 failed`，失败项为 `SchedulingControllerTests.BatchOptimize_WithDueDate_ShouldReturnCompareResults` 和 `SchedulingControllerTests.RescheduleItem_WhenItemNotExists_ShouldReturnNotFound`，均在 100s 触发 `TaskCanceledException`。
- 根因：`TestWebApplicationFactory` 没有替换 `IScheduleOptimizationService`，Integration 排产优化接口走真实 `SchedulingAgent -> LlmGatewayService`，本地无外部 LLM 时请求卡到 `HttpClient` 超时。
- 修复：在 `TestWebApplicationFactory` 中移除生产 `IScheduleOptimizationService` 注册，注入确定性的 `TestScheduleOptimizationService`，让 Integration 只验证 API / 持久化 / 路由契约，不依赖外部 LLM。
- 验证：两个红项目标复跑通过，`2 passed / 0 failed`。
- 验证：非 PerformanceTests Integration 复跑通过，`166 passed / 0 failed`。
- 验证：完整 Integration 复跑通过，`174 passed / 0 failed`。
- 验证：后端 solution 输出 Unit `430 passed`、Integration `174 passed`、Evaluation `2 passed`、Architecture `85 passed`，但固定 `LogFileName` 会覆盖 solution TRX。
- 验证：已补独立 TRX：Evaluation `2 passed`，Architecture `85 passed`。

## Release Boundary

- 本片恢复本地后端测试基线可信度。
- Hosted CI、staging rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察仍缺真实外部证据，不能被本地测试结果替代。
