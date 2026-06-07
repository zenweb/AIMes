# 2026-05-31 Sprint 5 M3 Scheduler Agent Options Issue

## 已处理

- 问题：`SchedulerAgentEventHandler` 位于 Application 层，却直接注入 `IConfiguration` 读取 `Agent:*` 配置。
  - 风险：配置读取跨层分散，轮询间隔非法值被运行时 clamp 掩盖，无法启动期暴露。
  - 处理：新增 `SchedulerAgentOptions`，通过 `IOptions<T>` 注入后台服务，并启用启动时 DataAnnotations 校验。

## 行为变化

- `Agent:SchedulingEventPollSeconds` 低于 15 或高于 3600 时会启动校验失败。
- 后台服务禁用日志不再直接包含配置 key 文本。
- `Messaging:Transport=Disabled` 时不再注册半截 MassTransit bus。

## 未关闭事项

- M3 剩余 raw configuration 读取点仍需继续处理：Aimes flags、Qdrant health check。
