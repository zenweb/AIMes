# 2026-05-31 Sprint 5 M3 Scheduler Agent Options

## 变更

- 新增 `SchedulerAgentOptions`，描述 `Agent:EnableSchedulingEventHandler` 与 `Agent:SchedulingEventPollSeconds`。
- `SchedulerAgentEventHandler` 改为注入 `IOptions<SchedulerAgentOptions>`，不再直接依赖 `IConfiguration`。
- Program 注册 `AddOptions<SchedulerAgentOptions>()`，绑定 `Agent` section，并启用 `ValidateDataAnnotations()` 与 `ValidateOnStart()`。
- `SchedulingEventPollSeconds` 通过 `[Range(15, 3600)]` 校验，替代运行时 `Math.Clamp`。
- 更新 SchedulerAgentEventHandler 集成测试构造方式，使用 `Options.Create(new SchedulerAgentOptions())`。
- 修复 Messaging Disabled 模式下 MassTransit 半注册问题：Disabled 时只注册 Options 校验，不注册 MassTransit bus。
- 新增架构门禁 `M3SchedulerAgentConfiguration_ShouldUseValidatedOptionsInsteadOfRawConfiguration`。
- 新增单测 `SchedulerAgentOptionsTests`，覆盖默认关闭与轮询间隔边界值。

## 验证

- 红灯：新增架构门禁曾因缺少 `SchedulerAgentOptions` 与 raw `IConfiguration` 注入失败。
- 红灯：新增单测曾因 `SchedulerAgentOptions` 类型不存在导致编译失败。
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore --filter "FullyQualifiedName~SchedulerAgentOptionsTests"` 通过，`4/4 passed`。
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore --filter "FullyQualifiedName~M3SchedulerAgentConfiguration"` 通过，`1/1 passed`。
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --no-restore --filter "FullyQualifiedName~SchedulerAgentEventHandler"` 通过，`4/4 passed`。
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --no-restore --filter "FullyQualifiedName~MessagingOptionsValidationTests"` 通过，`3/3 passed`。
- `dotnet build src/backend/MES.Api/MES.Api.csproj --no-restore` 通过，`0 warning / 0 error`。

## 范围说明

- 本轮关闭 M3 中 SchedulerAgentEventHandler 的 raw configuration 注入。
- Aimes flags、Qdrant health check 等 raw configuration 读取点仍需继续处理或记录豁免。
