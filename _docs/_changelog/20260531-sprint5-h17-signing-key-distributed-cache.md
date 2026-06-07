# 2026-05-31 Sprint 5 H17 Signing Key Distributed Cache

## 变更

- `SigningKeyStore` 新增可选 `IDistributedCache` 构造器，用于 Redis-backed 多副本共享签名 key。
- 初始 key 与轮转 key 会写入 `aimes:signing-key:*` cache key。
- `GetKeyById` / `GetAllValidKeys` 会从分布式缓存按需加载其它副本发布的 key。
- Program 构造 `SigningKeyStore` 时传入已配置的 `IDistributedCache`，复用现有 Redis / memory fallback 注册。
- 新增 H17 架构门禁，防止回退到纯进程内 key store。
- 扩展 `SigningKeyStoreTests`，覆盖跨实例读取初始 key 与轮转 key。

## 验证

- 红灯：新增单测曾因 `SigningKeyStore` 缺少 `IDistributedCache` 构造器编译失败。
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore --filter "FullyQualifiedName~SigningKeyStoreTests"` 通过，`10/10 passed`。
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore --filter "FullyQualifiedName~H17SigningKeyStore"` 通过，`1/1 passed`。
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore --filter "FullyQualifiedName~SigningKeyStoreTests|FullyQualifiedName~TokenBlacklistServiceTests"` 通过，`15/15 passed`。
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --no-restore --filter "FullyQualifiedName~CacheOptionsValidationTests"` 通过，`2/2 passed`。
- `dotnet build src/backend/MES.Api/MES.Api.csproj --no-restore` 通过，`0 warning / 0 error`。

## 范围说明

- 本轮关闭 H17 的多副本 key 验证共享缺口。
- 当前实现仍使用对称 key material 存入 `IDistributedCache`，生产 Redis 需要按基础设施要求启用访问控制与加密传输。
