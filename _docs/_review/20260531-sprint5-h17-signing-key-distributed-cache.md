# 2026-05-31 Sprint 5 H17 Signing Key Distributed Cache Review

## 结论

- 本地审计通过：`SigningKeyStore` 已具备 Redis-backed `IDistributedCache` key 发布与读取能力。
- Program 使用同一个 `IDistributedCache` 注册，和 TokenBlacklistService 共享 Redis / memory fallback 基础设施。

## 覆盖点

- 单实例原有构造器仍保留，既有单测继续通过。
- 两个 `SigningKeyStore` 实例共享同一个分布式缓存时，第二个实例可以读取第一个实例的初始 key。
- 第一个实例轮转后，第二个实例可以读取轮转 key。
- 轮转顺序测试仍覆盖先存 key 再发布 current kid。

## 剩余风险

- 单测使用 `MemoryDistributedCache` 模拟共享 cache，不等同真实 Redis 网络/序列化/过期策略压测。
- key material 存在 Redis 中，生产环境必须把 Redis 视为敏感密钥基础设施。
