# 2026-05-31 Sprint 5 M3 Messaging Options Review

## 结论

- 本地审计通过：Messaging transport 与 RabbitMQ 连接串已纳入 `IOptions<MessagingOptions>` + `ValidateOnStart()` 启动校验。
- MassTransit 注册保持单一 transport 形状，避免同时注册 InMemory 与 RabbitMQ。

## 覆盖点

- `Messaging:Transport=Disabled` 时允许缺少 `ConnectionStrings:RabbitMQ`。
- unsupported transport 会在启动验证阶段抛出 `OptionsValidationException`。
- `Messaging:Transport=RabbitMQ` 且缺少 RabbitMQ 连接串时会拒绝启动。
- 架构测试防止 Messaging 注册与 RabbitMQ health check 回退到 raw configuration。

## 剩余风险

- `MessagingOptions.BindFromConfiguration` 是集中绑定点，内部仍读取标准 connection string section。
- 本轮未处理 Cache、Aimes flags、Qdrant、SchedulerAgentEventHandler 的配置读取。
