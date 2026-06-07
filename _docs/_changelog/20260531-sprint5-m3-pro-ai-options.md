# 2026-05-31 Sprint 5 M3 Pro AI Options

## 变更

- `LlmGatewayService` 改为通过 `IOptions<LlmConfig>` 获取 Pro AI LLM 配置。
- `QdrantVectorStoreService` 改为通过 `IOptions<QdrantConfig>` 获取 Qdrant 配置。
- `OnnxInferenceService` 改为通过 `IOptions<OnnxConfig>` 获取 ONNX 配置。
- `LlmEndpoints` 的 `/config` 查询改为通过 `IOptions<LlmConfig>` 读取配置。
- `AddAIServices` 移除 `new LlmConfig/VectorStoreConfig/OnnxConfig + Bind(...) + AddSingleton(config)` 手动绑定路径。
- 新增架构门禁 `Sprint5ProAiConfiguration_ShouldUseOptionsInsteadOfManualRuntimeBinding`，防止 Pro AI 运行时配置回退到手动 `IConfiguration` bind。

## 验证

- 红灯：新增门禁曾因 `var llmConfig = new LlmConfig();` 等手动绑定失败。
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore --filter "FullyQualifiedName~Sprint5ProAiConfiguration"` 通过，`1/1 passed`。
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-build --filter "FullyQualifiedName~VectorStoreServiceTests|FullyQualifiedName~KnowledgeAgentTests|FullyQualifiedName~QualityAgentTests|FullyQualifiedName~ProcessParameterAgentTests|FullyQualifiedName~MaintenanceAgentTests|FullyQualifiedName~AnomalyAgentTests"` 通过，`43/43 passed`。
- `dotnet build src/backend/MES.Api/MES.Api.csproj --no-restore` 通过，`0 warning / 0 error`。

## 范围说明

- 本轮只迁移 Pro AI 运行时配置注入，不调整 LLM provider、Qdrant provider 或 ONNX 模型行为。
- `MesDbContextFactory` 是 EF Core 设计时工厂，仍允许为 `dotnet ef` 读取连接串。
- Serilog `ReadFrom.Configuration(context.Configuration)` 是日志框架配置入口，不纳入业务配置 Options 迁移。
