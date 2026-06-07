# 2026-05-31 Sprint 4 H15 Review

## 结论

- 本地代码审计未发现 H15 明确范围内的剩余缺口。
- 关键出站 HTTP 依赖已从裸 `HttpClient`/默认 client 收敛到命名 factory client，并由架构测试守住。

## 覆盖点

- `LlmGatewayService`：Azure OpenAI、OpenAI、Ollama 的 SK/OpenAI 出站调用均接收 factory 创建的 `HttpClient`。
- `QdrantHealthCheck`：readiness 探针不再直接实例化 `HttpClient`。
- `ServiceCollectionExtensions.AddAIServices`：命名 client 均挂接标准 resilience handler。
- 架构门禁：检查包引用、命名 client 注册、resilience handler、LLM factory client、Qdrant factory client。

## 剩余风险

- 尚未连接真实 Azure OpenAI/OpenAI/Ollama/Qdrant 环境做故障注入；重试、熔断、超时行为仍需在 staging/灰度中观测。
- `QdrantVectorStoreService` 仍使用 `QdrantClient` SDK 构造方式，不属于本次 “直接 new HttpClient” 缺口；若后续要求统一 SDK transport，需要单独设计。
