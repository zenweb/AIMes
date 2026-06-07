# 2026-05-31 Sprint 5 M3 Pro AI Options Review

## 结论

- 本地审计通过：Pro AI 运行时服务不再直接注入手动绑定的 config singleton。
- `AddAIServices` 仍保留 `AddOptions<T>().ValidateOnStart()`，并通过 DI 的 `IOptions<T>` 选择 LLM concurrency、Qdrant provider 和 ONNX 配置。

## 覆盖点

- `LlmGatewayService`、`QdrantVectorStoreService`、`OnnxInferenceService`、`LlmEndpoints` 均消费 `IOptions<T>`。
- `ILlmConcurrencyGate` 使用 `IOptions<LlmConfig>.Value.MaxConcurrency` 构造。
- `IVectorStoreService` 的 Qdrant/InMemory 选择来自 `IOptions<VectorStoreConfig>.Value.Provider`。
- Qdrant 子配置通过 `IOptions<QdrantConfig>` 从 `IOptions<VectorStoreConfig>.Value.Qdrant` 派生。

## 豁免

- `MesDbContextFactory`：设计时 `IDesignTimeDbContextFactory<MesDbContext>`，仅供 `dotnet ef` 使用；允许直接读取 `Database:Provider` 与 `DefaultConnection`。
- `ReadFrom.Configuration(context.Configuration)`：Serilog 框架扩展读取日志配置，不属于应用业务配置直接访问。
- `*Options.BindFromConfiguration` 内部读取连接串是集中绑定入口，受对应 Options 门禁覆盖。

## 剩余风险

- 本轮没有启动真实 Pro AI provider；验证覆盖编译、门禁和 AI 单测。
- Pro-only 代码在开源编译常量下仍依赖项目既有条件编译排除规则。
