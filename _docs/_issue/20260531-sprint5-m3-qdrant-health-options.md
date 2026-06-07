# 2026-05-31 Sprint 5 M3 Qdrant Health Options Issue

## 已处理

- 问题：`QdrantHealthCheck` 直接读取 `AI:VectorStore:*` raw configuration。
  - 风险：provider、host、port、api key 的读取分散在 health check 内，无法统一启动期校验，也不符合 M3 配置所有权收敛目标。
  - 处理：新增 `QdrantHealthOptions`，通过 `IOptions<T>` 注入 `QdrantHealthCheck`，并启用 DataAnnotations 与启动期校验。

## 行为变化

- 非 Qdrant provider 仍返回 Healthy，且不会触发 HTTP client 创建。
- Qdrant host 缺失时的 health check 错误信息改为不暴露完整配置 key。
- 启用 Qdrant provider 时，非法 host/port 会在启动校验阶段失败。

## 未关闭事项

- M3 剩余 raw configuration 读取点继续聚焦 Aimes flags。
