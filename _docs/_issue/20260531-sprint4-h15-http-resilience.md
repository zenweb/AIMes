# 2026-05-31 Sprint 4 H15 Issue

## 已处理

- 问题：`QdrantHealthCheck` 直接 `new HttpClient`，绕过 factory、遥测与 resilience。
  - 处理：改为注入 `IHttpClientFactory`，使用 `qdrant-health` 命名 client。
- 问题：LLM/SK 生成路径未显式使用 factory client。
  - 处理：Azure OpenAI、OpenAI、Ollama 均通过 `IHttpClientFactory` 创建 `HttpClient` 后传入 connector/OpenAIClient。
- 问题：AI 服务仅有裸 `services.AddHttpClient()`，缺少标准弹性策略。
  - 处理：改为命名 client，并统一挂接 `AddStandardResilienceHandler()`。

## 未关闭的外部验证

- staging 中真实 provider 的故障注入与遥测观察尚未执行。
- 首次灰度与 2 周无 P0/P1 观察仍属于 v1.0.0 发布硬条件，不在本地 H15 代码变更中关闭。
