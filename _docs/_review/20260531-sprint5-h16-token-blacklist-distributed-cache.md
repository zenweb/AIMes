# 2026-05-31 Sprint 5 H16 Token Blacklist Distributed Cache Review

## 结论

- 本地审计通过：Token 黑名单撤销状态已通过 `IDistributedCache` 存储，可由 Redis 支撑多副本共享。
- `TokenBlacklistService` 没有进程内集合保存撤销状态，避免多实例之间黑名单不一致。

## 覆盖点

- `TokenBlacklistService` 构造函数依赖 `IDistributedCache`。
- `BlacklistAsync` 使用 `_cache.SetAsync(...)` 写入 `aimes:token-blacklist:` 前缀键。
- `IsBlacklistedAsync` 使用 `_cache.GetAsync(...)` 查询撤销状态。
- `AddCacheServices` 在有 Redis 连接串时注册 `AddStackExchangeRedisCache`，否则使用 `AddDistributedMemoryCache` 作为本地 fallback。
- `Program.cs` 通过 DI 注册 `TokenBlacklistService`，使其接收当前配置的 `IDistributedCache`。

## 剩余风险

- 本轮没有运行真实 Redis 实例的跨进程集成测试；当前证据覆盖 DI/架构和 memory-backed 行为。
- Redis 连接串有效性依赖既有 `CacheOptions` 启动校验和部署环境配置。
