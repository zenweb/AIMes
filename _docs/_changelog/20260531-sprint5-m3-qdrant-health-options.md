# 2026-05-31 Sprint 5 M3 Qdrant Health Options

## 变更

- 新增 `QdrantHealthOptions`，绑定 `AI:VectorStore`，描述 VectorStore provider 与 Qdrant endpoint。
- `QdrantHealthCheck` 改为注入 `IOptions<QdrantHealthOptions>`，不再直接读取 raw `IConfiguration`。
- Program 注册 `AddOptions<QdrantHealthOptions>()`，启用 `ValidateDataAnnotations()` 与 `ValidateOnStart()`。
- 启用 Qdrant provider 时显式校验 endpoint：Host 不能为空，Port 必须在 1 到 65535。
- 保留 `IHttpClientFactory.CreateClient("qdrant-health")` 出站 HTTP 模式，避免回退到手动 `HttpClient`。
- 新增架构门禁 `M3QdrantHealthConfiguration_ShouldUseValidatedOptionsInsteadOfRawConfiguration`。
- 新增单测 `QdrantHealthCheckTests`，覆盖非 Qdrant provider 时直接 Healthy 且不发 HTTP 请求。
- 新增集成测试 `QdrantHealthOptionsValidationTests`，覆盖非法 Qdrant port 启动期失败。

## 验证

- 红灯：新增架构门禁曾因缺少完整 `QdrantHealthOptions` 形状失败。
- 红灯：新增单测曾因 `QdrantHealthOptions` 类型不存在导致编译失败。
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore --filter "FullyQualifiedName~M3QdrantHealthConfiguration"` 通过，`1/1 passed`。
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore --filter "FullyQualifiedName~QdrantHealthCheckTests"` 通过，`1/1 passed`。
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --no-restore --filter "FullyQualifiedName~QdrantHealthOptionsValidationTests"` 通过，`1/1 passed`。
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore --filter "FullyQualifiedName~H15OutboundHttp"` 通过，`1/1 passed`。
- `dotnet build src/backend/MES.Api/MES.Api.csproj --no-restore` 通过，`0 warning / 0 error`。

## 范围说明

- 本轮关闭 Qdrant health check 的 raw configuration 读取点。
- M3 剩余 raw configuration 读取点继续聚焦 Aimes flags；设计时工厂与集中绑定入口按既有豁免口径另行审计。
