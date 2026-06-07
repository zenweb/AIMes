# 2026-05-31 Sprint 5 M1/M2 JWT Options

## 变更

- 新增 `JwtOptions`，用 DataAnnotations 描述 `Issuer`、`Audience`、`SigningKey`。
- `Program.cs` 注册 `AddOptions<JwtOptions>()`，绑定 `Jwt` section，并启用 `ValidateDataAnnotations()`、签名密钥长度校验和 `ValidateOnStart()`。
- `SigningKeyStore` 改由已验证的 `IOptions<JwtOptions>` 构造。
- `JwtBearerOptions` 改通过 DI 配置，使用 `SigningKeyStore` 与 `JwtOptions` 设置验证参数。
- `AuthEndpoints` 发放 token 时改用 `IOptions<JwtOptions>`，不再直接读取 `IConfiguration`。
- 新增架构门禁 `M1M2JwtConfiguration_ShouldUseValidatedOptionsInsteadOfRawConfiguration`。

## 验证

- 红灯：新增门禁曾因缺少 `JwtOptions`、`Program.cs`/`AuthEndpoints` 直接读取 `IConfiguration` 失败。
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore --filter "FullyQualifiedName~M1M2JwtConfiguration"` 通过，`1/1 passed`。
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --no-restore --filter "FullyQualifiedName~JwtStartupValidationTests"` 通过，`2/2 passed`。
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --no-restore --filter "FullyQualifiedName~AuthControllerTests"` 通过，`5/5 passed`。
- `dotnet build src/backend/MES.Api/MES.Api.csproj --no-restore` 通过，`0 warning / 0 error`。

## 范围说明

- 本轮只关闭 JWT 配置的 Options 化。
- DB 与 CORS 配置仍需继续迁移到 `IOptions<T>` + `ValidateOnStart()`。
