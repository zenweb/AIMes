# 2026-05-31 Sprint 5 M3 Cache Options Issue

## 已处理

- 问题：Redis connection string 在 cache 注册和 health check 中直接读取配置。
  - 风险：配置读取分散，后续容易出现 cache 与 ready health check 使用不同配置来源。
  - 处理：新增 `CacheOptions`，集中绑定 Redis connection string 与 instance name。

## 行为变化

- 未配置 Redis 时继续使用 `DistributedMemoryCache`。
- 配置 Redis 时，cache 注册与 Redis ready health check 共用同一 Options 绑定逻辑。

## 未关闭事项

- M3 剩余 raw configuration 读取点仍需继续处理：Aimes flags、Qdrant health check、SchedulerAgentEventHandler。
