# 2026-05-31 Sprint 4 下一步

## 已完成

- B3：OnTimeRate 新口径已实现、文档化，并有单元测试与 dashboard 集成测试。
- H14：`MetricsBackgroundService` 已增加 monitoring 订阅者门控；无 SignalR 订阅者时不创建 scope、不查询 KPI/数据库，并有单元测试覆盖。
- H15：关键出站 HTTP 已接入命名 `IHttpClientFactory` client + `AddStandardResilienceHandler`；LLM/SK 与 Qdrant readiness 均不再使用裸 `HttpClient`。
- LLM 成本：新增全局 singleton 并发闸门，`LlmGatewayService` 的 text/json/embedding 调用统一排队；`SchedulingAgent` prompt 预算沿用 4000 token 门禁并有回归测试。
- 4.6 缓存事件驱动：`SchedulingContextProvider` 的 full snapshot 改用共享 cache token；operation/schedule 事件会触发全局失效，避免继续读取旧产能、WIP、物料上下文。

## 下一步

- 灰度验证：在 staging 验证 `/ready` 外部依赖、OTLP/Seq/Tempo、报表 OnTimeRate 真实数据口径。
- 事件验证：在 staging 或集成环境触发报工/排产计划创建，确认下一次排产上下文会重新查库并刷新 snapshot。
