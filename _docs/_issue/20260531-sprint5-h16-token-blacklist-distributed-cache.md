# 2026-05-31 Sprint 5 H16 Token Blacklist Distributed Cache Issue

## 已关闭

- H16 要求 Token 黑名单从进程内状态迁到 Redis-backed 共享缓存，避免多副本部署时 logout/revoke 只在单实例生效。

## 处理

- 当前 `TokenBlacklistService` 已使用 `IDistributedCache` 写入和读取 JTI 黑名单。
- `AddCacheServices` 已支持 Redis 与本地 memory fallback。
- 本轮新增 H16 架构门禁，防止回退为进程内集合或绕过 `IDistributedCache`。

## 待跟踪

- 若要证明真实多副本共享，需要后续接入 Redis testcontainer 或部署环境 smoke test。
