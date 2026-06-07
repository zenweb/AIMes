# 2026-05-31 Sprint 5 M3 Messaging Options Issue

## 已处理

- 问题：Messaging transport 与 RabbitMQ connection string 在 MassTransit 注册和 health check 中直接读取配置。
  - 风险：配置读取分散，RabbitMQ transport 缺连接串时缺少统一启动校验。
  - 处理：新增 `MessagingOptions`，集中绑定并启用启动时 Options 校验。

## 行为变化

- `Messaging:Transport` 只允许 `Disabled`、`InMemory`、`RabbitMQ`。
- `RabbitMQ` transport 必须配置 `ConnectionStrings:RabbitMQ`。
- `Disabled` transport 允许缺少 RabbitMQ 连接串。

## 未关闭事项

- M3 剩余 raw configuration 读取点仍需继续处理：Cache、Aimes flags、Qdrant health check、SchedulerAgentEventHandler。
