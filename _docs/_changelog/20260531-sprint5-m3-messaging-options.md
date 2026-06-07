# 2026-05-31 Sprint 5 M3 Messaging Options

## 变更

- 新增 `MessagingOptions`，统一描述 `Messaging:Transport` 与 `ConnectionStrings:RabbitMQ`。
- `AddMessagingServices` 注册 `AddOptions<MessagingOptions>()`，通过 `MessagingOptions.BindFromConfiguration` 绑定配置，并启用 `ValidateDataAnnotations()`、transport 支持校验、RabbitMQ 连接串条件校验和 `ValidateOnStart()`。
- MassTransit 注册改由 `MessagingOptions` 决定 Disabled / InMemory / RabbitMQ 单一 transport，不再散落读取 `Messaging:Transport` 与 `ConnectionStrings:RabbitMQ`。
- Program 中 RabbitMQ ready health check 改用 `MessagingOptions` 绑定结果。
- 新增架构门禁 `M3MessagingConfiguration_ShouldUseValidatedOptionsInsteadOfRawConfiguration`。
- 新增集成测试 `MessagingOptionsValidationTests`，覆盖 Disabled 无连接串、非法 transport、RabbitMQ 缺连接串三种启动验证路径。

## 验证

- 红灯：新增架构门禁曾因缺少 `MessagingOptions` 失败。
- 红灯：新增集成测试曾因缺少 `IStartupValidator` / Options 注册失败。
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore --filter "FullyQualifiedName~M3MessagingConfiguration"` 通过，`1/1 passed`。
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --no-restore --filter "FullyQualifiedName~MessagingOptionsValidationTests"` 通过，`3/3 passed`。
- `dotnet build src/backend/MES.Api/MES.Api.csproj --no-restore` 通过，`0 warning / 0 error`。

## 范围说明

- 本轮只关闭 M3 中 Messaging/RabbitMQ 配置子切片。
- Cache、Aimes flags、Qdrant health check、SchedulerAgentEventHandler 等 raw configuration 读取点仍需按配置所有权继续分批处理或记录豁免。
