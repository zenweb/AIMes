# 2026-05-31 Sprint 4 H15 Http Resilience

## 变更

- 为 API 项目新增 `Microsoft.Extensions.Http.Resilience` 包引用与集中版本。
- 在 AI 服务注册中新增 `azure-openai`、`openai`、`ollama`、`qdrant-health` 命名 `HttpClient`，并统一接入 `AddStandardResilienceHandler()`。
- `LlmGatewayService` 的 Semantic Kernel/OpenAI 调用改为使用 `IHttpClientFactory` 创建的客户端；Ollama OpenAIClient 使用 `HttpClientPipelineTransport` 承接 factory client。
- `QdrantHealthCheck` 改为构造函数注入 `IHttpClientFactory`，通过 `qdrant-health` 命名客户端访问 `/healthz`。
- 新增 H15 架构测试，阻止关键服务回退到裸 `new HttpClient()`、unnamed client 或缺失标准弹性 handler。

## 验证

- `dotnet restore src/backend/MES.Api/MES.Api.csproj`
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore --filter "FullyQualifiedName~H15OutboundHttp"`
- `dotnet build src/backend/MES.Api/MES.Api.csproj --no-restore`
