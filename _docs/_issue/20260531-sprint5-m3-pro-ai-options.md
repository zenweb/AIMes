# 2026-05-31 Sprint 5 M3 Pro AI Options Issue

## 已关闭

- Pro AI 运行时配置在 `AddAIServices` 中存在 `new Config + configuration.GetSection(...).Bind(...) + AddSingleton(config)` 手动绑定路径。
- 风险：绕过 `IOptions<T>` 的统一配置入口，后续容易和 `ValidateOnStart()` 行为产生分叉。

## 处理

- 将 Pro AI 服务和端点改为消费 `IOptions<T>`。
- 将 `ILlmConcurrencyGate`、Qdrant 子配置和 VectorStore provider 选择改为基于 DI 中的 `IOptions<T>`。
- 新增架构门禁防止手动 bind singleton config 回流。

## 待跟踪

- 真实 Azure OpenAI/OpenAI/Ollama/Qdrant/ONNX provider smoke test 需要有对应外部服务和密钥后再执行。
