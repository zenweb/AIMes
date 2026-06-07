# 2026-06-05 Backend Integration LLM Test Fake Review

## Findings

- 审计结论：本片修复 Integration 测试环境依赖真实 LLM 导致排产优化接口超时的问题。
- 红项证据：非 PerformanceTests Integration 初次隔离结果为 `164 passed / 2 failed`，两个失败都来自排产优化请求 100s 取消。
- 根因证据：失败请求路径 `/api/v1/scheduling/optimize` / `/api/v1/scheduling/optimize-compare` 会进入 `SchedulingAppService -> IScheduleOptimizationService`；测试工厂未覆盖该服务，生产注册指向 `ScheduleOptimizationAdapter -> SchedulingAgent -> LlmGatewayService`。
- 修复范围：只改 Integration `TestWebApplicationFactory`，不改生产 DI，不改变真实排产优化实现。
- 回归证据：目标红项 `2 passed`；非 PerformanceTests Integration `166 passed`；完整 Integration `174 passed`；后端 Unit `430 passed`；Evaluation `2 passed`；Architecture `85 passed`。
- 证据质量：solution 级 `dotnet test` 输出全绿，但多个测试项目共用同一个 `LogFileName` 会覆盖 TRX；因此同时保留各项目独立 TRX 作为权威证据。

## Residual Risk

- 本地 Integration fake 证明 API 合约和持久化链路，不证明真实 LLM provider 在 staging 可用。
- 发布边界未关闭：Hosted CI、staging、攻击链验证、安全签字、灰度和 14 天观察仍需真实外部证据。
