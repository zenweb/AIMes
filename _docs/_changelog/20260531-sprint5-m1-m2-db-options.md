# 2026-05-31 Sprint 5 M1/M2 DB Options

## 变更

- 新增 `DatabaseOptions`，统一描述 `Database:Provider` 与 `ConnectionStrings:DefaultConnection`。
- `AddDatabaseServices` 注册 `AddOptions<DatabaseOptions>()`，通过 `DatabaseOptions.BindFromConfiguration` 绑定配置，并启用 `ValidateDataAnnotations()`、provider 支持校验、默认连接串校验和 `ValidateOnStart()`。
- `MesDbContext` 注册改从 `IOptions<DatabaseOptions>` 读取 provider 与 connection string，不再在注册阶段手写配置异常。
- DB health check 的 PostgreSQL 注册逻辑改复用 `DatabaseOptions.BindFromConfiguration`，避免直接读取 `Database:Provider` 与 `ConnectionStrings:DefaultConnection`。
- 新增架构门禁 `M1M2DatabaseConfiguration_ShouldUseValidatedOptionsInsteadOfRawConfiguration`。
- 新增集成测试 `DatabaseOptionsValidationTests`，覆盖缺连接串、非法 provider、合法配置三种启动验证路径。

## 验证

- 红灯：新增架构门禁曾因缺少 `DatabaseOptions` 失败。
- 红灯：新增集成测试曾因注册阶段手写 `InvalidOperationException` 与缺少 `IStartupValidator` 语义失败。
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore --filter "FullyQualifiedName~M1M2DatabaseConfiguration"` 通过，`1/1 passed`。
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --no-restore --filter "FullyQualifiedName~DatabaseOptionsValidationTests"` 通过，`3/3 passed`。
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore --filter "FullyQualifiedName~M1M2"` 通过，`3/3 passed`。
- `dotnet build src/backend/MES.Api/MES.Api.csproj --no-restore` 通过，`0 warning / 0 error`。

## 范围说明

- 本轮关闭 M1/M2 中 DB 配置的 Options 化。
- EF 设计时 `MesDbContextFactory` 仍保留 raw configuration 读取，仅供 `dotnet ef` CLI 使用，不参与运行时 DI/启动校验。
