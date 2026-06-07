# 2026-05-31 Sprint 5 M3 Aimes Host Options

## 变更

- 新增 `AimesHostOptions`，绑定 `Aimes` section，描述 host 级运行开关。
- Program 注册 `AddOptions<AimesHostOptions>()`，启用 `ValidateDataAnnotations()` 与 `ValidateOnStart()`。
- `TrustForwardedHeaders`、`EnableSwagger`、`DisableHttpsRedirect` 改为从 `AimesHostOptions` 读取，不再直接 `GetValue<bool>`。
- 新增架构门禁 `M3AimesHostConfiguration_ShouldUseValidatedOptionsInsteadOfRawConfiguration`。

## 验证

- 红灯：新增架构门禁曾因缺少 `AimesHostOptions` 与 raw `GetValue<bool>` 读取失败。
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore --filter "FullyQualifiedName~M3AimesHostConfiguration"` 通过，`1/1 passed`。
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore --filter "FullyQualifiedName~M3"` 通过，`5/5 passed`。
- `dotnet build src/backend/MES.Api/MES.Api.csproj --no-restore` 通过，`0 warning / 0 error`。

## 范围说明

- 本轮关闭 Program 中 Aimes host flags 的 raw configuration 读取点。
- `MesDbContextFactory` 属于设计时工厂，仍按设计时配置入口另行审计，不计入本轮 host pipeline runtime 迁移。
