# 2026-05-31 Sprint 5 H17 Signing Key Distributed Cache Issue

## 已处理

- 问题：`SigningKeyStore` 只使用进程内 `ConcurrentDictionary` 保存当前和历史签名 key。
  - 风险：多副本部署时 A 实例签发/轮转的 token，B 实例可能无法验证对应 `kid`。
  - 处理：通过 `IDistributedCache` 发布初始 key 与轮转 key，验证时按 `kid` 从共享 cache 加载。

## 行为变化

- 单副本 / 未配置 Redis 时仍可通过 distributed memory fallback 工作。
- 配置 Redis 后，签名 key 与 token blacklist 共用 Redis-backed `IDistributedCache`。
- 旧 key 仍保留本地 24h 验证缓冲；cache 条目使用 2 天 sliding expiration 覆盖缓冲窗口。

## 未关闭事项

- Redis 真实连通性、访问控制、传输加密属于 staging/生产环境验收项，不能由本地单测替代。
