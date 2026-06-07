# 2026-05-31 Sprint 3 H6 Issue

## 已处理

- 问题：`TestWebApplicationFactory` 默认总是返回认证成功，无法表达真实匿名请求。
  - 处理：新增 `X-Test-Anonymous: true` 测试头，认证处理器返回 `NoResult()`，让授权中间件产生真实 `401`。
- 问题：M7 后 `Equipment` shadow concurrency token 已存在，但 `DataSeeder` 的 Equipment 模型种子未提供 `version`。
  - 处理：补齐两个 Equipment 种子的 `version = 0u`。

## 待跟踪

- Hub 授权：`/hubs/notifications` 与 `/hubs/monitoring` 不在 H6 `/api/v1/*` 范围内，后续如纳入安全基线需单独验证。
- 全端点匿名运行时矩阵：当前由架构门覆盖全部 group，运行时只抽样验证关键路径；如需要更强证据，可生成 endpoint metadata 矩阵测试。
