# 2026-05-31 Sprint 5 M1/M2 CORS Options

## 变更

- 新增 `CorsOptions`，用 DataAnnotations 描述 `AllowedOrigins`，并提供允许源非空校验与标准化读取。
- `AddCorsServices` 注册具名 `AddOptions<CorsOptions>(CorsOptions.OptionsName)`，绑定根配置，并启用 `ValidateDataAnnotations()`、`Validate(CorsOptions.HasAllowedOrigins, ...)` 和 `ValidateOnStart()`。
- Production CORS policy 改从 `CorsOptions.GetNormalizedAllowedOrigins()` 读取允许源，不再手写 `configuration.GetSection("AllowedOrigins")` 或 `InvalidOperationException`。
- 集成测试改用 `IStartupValidator.Validate()` 验证启动时 Options 校验语义。
- 调整架构门禁 `M1M2CorsConfiguration_ShouldUseValidatedOptionsInsteadOfRawConfiguration`，接受具名 Options 注册并继续禁止 ad-hoc `BuildServiceProvider()`。

## 验证

- 红灯：架构门禁曾因期望无参 `AddOptions<CorsOptions>()` 失败。
- 红灯：CORS 集成测试曾仍按注册时 `InvalidOperationException` 断言，和 `ValidateOnStart()` 触发语义不匹配。
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore --filter "FullyQualifiedName~M1M2CorsConfiguration"` 通过，`1/1 passed`。
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --no-restore --filter "FullyQualifiedName~CorsPolicyTests"` 通过，`2/2 passed`。
- `dotnet build src/backend/MES.Api/MES.Api.csproj --no-restore` 通过，`0 warning / 0 error`。

## 范围说明

- 本轮只关闭 CORS 配置的 Options 化。
- M1/M2 中 DB 配置迁移仍需继续处理。
