# 2026-05-31 Sprint 5 M3 Cache Options

## 变更

- 新增 `CacheOptions`，统一描述 `ConnectionStrings:Redis` 与 Redis instance name。
- `AddCacheServices` 注册 `AddOptions<CacheOptions>()`，通过 `CacheOptions.BindFromConfiguration` 绑定配置并启用 `ValidateOnStart()`。
- Redis cache / DistributedMemoryCache fallback 改由 `CacheOptions.HasRedisConnection` 决定。
- Program 中 Redis ready health check 改用 `CacheOptions` 绑定结果。
- 新增架构门禁 `M3CacheConfiguration_ShouldUseValidatedOptionsInsteadOfRawConfiguration`。
- 新增集成测试 `CacheOptionsValidationTests`，覆盖无 Redis 连接串时 memory fallback、配置 Redis 连接串时 Options 绑定。

## 验证

- 红灯：新增架构门禁曾因缺少 `CacheOptions` 失败。
- 红灯：新增集成测试曾因 `CacheOptions` 类型不存在导致编译失败。
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore --filter "FullyQualifiedName~M3CacheConfiguration"` 通过，`1/1 passed`。
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --no-restore --filter "FullyQualifiedName~CacheOptionsValidationTests"` 通过，`2/2 passed`。
- `dotnet build src/backend/MES.Api/MES.Api.csproj --no-restore` 通过，`0 warning / 0 error`。

## 范围说明

- 本轮只关闭 M3 中 Cache/Redis 配置子切片。
- Aimes flags、Qdrant health check、SchedulerAgentEventHandler 等 raw configuration 读取点仍需按配置所有权继续分批处理或记录豁免。
