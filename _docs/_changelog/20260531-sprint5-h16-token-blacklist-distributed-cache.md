# 2026-05-31 Sprint 5 H16 Token Blacklist Distributed Cache

## 变更

- 补齐 H16 架构门禁 `H16TokenBlacklist_ShouldUseDistributedCacheForCrossReplicaRevocation`。
- 门禁确认 `TokenBlacklistService` 使用 `IDistributedCache` 存储撤销 JTI。
- 门禁确认 `TokenBlacklistService` 不使用进程内 `Dictionary` / `ConcurrentDictionary` / `HashSet` 保存撤销状态。
- 门禁确认 `AddCacheServices` 保留 Redis-backed `IDistributedCache` 与本地 memory fallback。

## 验证

- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore --filter "FullyQualifiedName~H16TokenBlacklist"` 通过，`1/1 passed`。
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore --filter "FullyQualifiedName~H16TokenBlacklist|FullyQualifiedName~H17SigningKeyStore"` 通过，`2/2 passed`。
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-build --filter "FullyQualifiedName~TokenBlacklistServiceTests"` 通过，`5/5 passed`。
- `dotnet build src/backend/MES.Api/MES.Api.csproj --no-restore` 通过，`0 warning / 0 error`。

## 范围说明

- 本轮未改 `TokenBlacklistService` 生产逻辑；当前实现已经通过 `IDistributedCache` 接入 Redis/memory cache。
- 本轮补的是 H16 防回退门禁与验收证据。
