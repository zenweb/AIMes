# 2026-05-31 Sprint 5 下一步

## 已完成

- 5.9 L1-L6 局部：消除 `SchedulingContextProvider.GetContextAsync` 中的 `Task.Result` 阻塞取值。
- 5.9 L1-L6 局部：新增架构门禁，防止 backend 源码重新出现 `xxxTask.Result` 或 `.Wait(...)`。
- 5.1 H2：确认导出渲染库只在 Infrastructure 层；DI 显式绑定到 `MES.Infrastructure.Services.ExportAppService`，并新增架构门禁。
- 5.2 H5：移除 Domain 实体 `[NotMapped]` 注解，运行态属性忽略规则保留在 Infrastructure Fluent API，并新增模型门禁。
- 5.3 M1/M2 局部：JWT 配置已迁到 `IOptions<JwtOptions>` + `ValidateOnStart()`；发 token 与验 token 共用同一 Options。
- 5.3 M1/M2 局部：CORS `AllowedOrigins` 已迁到 `IOptions<CorsOptions>` + `ValidateOnStart()`；Production policy 继续禁止 wildcard。
- 5.3 M1/M2：DB `Provider` 与 `DefaultConnection` 已迁到 `IOptions<DatabaseOptions>` + `ValidateOnStart()`；运行时 DbContext 与 DB health check 共用绑定逻辑。
- 5.3 M3 局部：Messaging `Transport` 与 `RabbitMQ` 连接串已迁到 `IOptions<MessagingOptions>` + `ValidateOnStart()`；MassTransit 与 RabbitMQ health check 共用绑定逻辑。
- 5.3 M3 局部：Cache `Redis` 连接串已迁到 `IOptions<CacheOptions>` + `ValidateOnStart()`；Redis cache 与 ready health check 共用绑定逻辑。
- 5.3 M3 局部：Scheduler Agent 后台轮询配置已迁到 `IOptions<SchedulerAgentOptions>` + `ValidateOnStart()`；Application 层不再直接注入 `IConfiguration`。
- 5.3 M3 局部：Qdrant ready health check 已迁到 `IOptions<QdrantHealthOptions>` + `ValidateOnStart()`；保留 named `qdrant-health` `IHttpClientFactory` client。
- 5.3 M3 局部：Aimes host flags 已迁到 `IOptions<AimesHostOptions>` + `ValidateOnStart()`；Program 不再直接 `GetValue<bool>("Aimes:*")`。
- 5.9 局部：`ScanEndpoints` 设备/工单扫码已改为仓储定点查询，不再全量 `GetAllAsync` 后内存过滤。
- H17：`SigningKeyStore` 已接入 `IDistributedCache`，支持 Redis-backed 多副本共享初始 key 与轮转 key。
- H16：`TokenBlacklistService` 已通过 `IDistributedCache` 支持 Redis-backed 多副本共享撤销状态，并新增架构门禁。
- M13：自定义 `RequestLoggingMiddleware` 已删除，请求日志收敛到 `UseSerilogRequestLogging()`。
- H1 扩展：`KnowledgeAppService` 向量库 `SearchAsync` / `UpsertAsync` 与 `OperationService` 工单仓储调用已传播 `CancellationToken`，并新增架构门禁。
- 5.9 死代码删除：移除未消费的 ERP/WMS/AGV/设备命令集成 Stub、接口和 DI 注册，并新增架构门禁。
- 5.3 M3 Pro AI：`LlmConfig` / `VectorStoreConfig` / `OnnxConfig` 运行时消费已收敛到 `IOptions<T>`，并记录设计时与 Serilog 豁免。

## 下一步

- H1 可在 Sprint 6 / 6.7 进一步系统化为 Roslyn analyzer。
- 继续推进 Sprint 6 / 6.7：用 Roslyn analyzer 系统化禁止 `.Result`、`.Wait()`、`Console.Write*` 等代码卫生问题。
