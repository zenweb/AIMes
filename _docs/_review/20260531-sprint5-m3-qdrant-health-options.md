# 2026-05-31 Sprint 5 M3 Qdrant Health Options Review

## 结论

- 本地审计通过：Qdrant ready health check 已纳入 `IOptions<QdrantHealthOptions>` + `ValidateOnStart()`。
- `QdrantHealthCheck` 不再直接依赖 `IConfiguration`，配置读取集中到 Options 绑定。

## 覆盖点

- 非 Qdrant provider 时返回 Healthy，并且不会创建或调用 HTTP client。
- Qdrant endpoint 的 `Host` 与 `Port` 由 Options 暴露给 health check。
- 启用 Qdrant provider 且 port 越界时，`IStartupValidator` 会抛出 `OptionsValidationException`。
- H15 出站 HTTP 门禁仍通过：继续使用 named `qdrant-health` `IHttpClientFactory` client。

## 剩余风险

- 当前 health check 单测只覆盖了 disabled/provider 非 Qdrant 分支；真实 Qdrant `/healthz` 成功、失败和 API key header 可在后续需要时补更细单测。
- M3 剩余 raw configuration 读取点仍有 Aimes flags，需要继续迁移或记录明确豁免。
