# 2026-05-31 Sprint 5 M3 Scheduler Agent Options Review

## 结论

- 本地审计通过：Scheduler Agent 后台轮询开关与间隔已纳入 `IOptions<SchedulerAgentOptions>` + `ValidateOnStart()`。
- Application 层不再为该后台服务注入 raw `IConfiguration`。

## 覆盖点

- 默认配置保持后台事件处理器关闭。
- 轮询间隔允许范围为 15 到 3600 秒。
- 现有四类事件触发集成测试仍通过：缺料、新工单、急单、设备故障。
- Messaging Disabled 模式回归已覆盖，避免 MassTransit 半注册导致 Host 构建失败。

## 剩余风险

- 本轮未处理 Aimes flags 与 Qdrant health check 的配置读取。
- `SchedulerAgentOptions` 的范围校验会让非法轮询间隔在启动期失败，和旧逻辑的自动 clamp 行为不同。
