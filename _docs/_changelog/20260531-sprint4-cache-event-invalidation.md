# 2026-05-31 Sprint 4 Cache Event Invalidation

## 变更

- 新增 `SchedulingContextCache`，用共享 `CancellationChangeToken` 管理排产上下文 full snapshot。
- `SchedulingContextProvider` 改用 `ISchedulingContextCache` 读写 full snapshot。
- `OperationReported` 与 `SchedulePlanCreated` domain event handler 会触发 full snapshot 全局失效。
- MassTransit integration consumers 消费报工/排产计划事件后也会触发共享 cache 失效。
- 新增单元测试验证 `InvalidateAll()` 后旧 full snapshot 不再可读。
- 新增架构测试防止 provider/consumer 回退到只 log 或只删除错误 key。

## 验证

- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore --filter "FullyQualifiedName~SchedulingContextCacheTests"`
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore --filter "FullyQualifiedName~Sprint4SchedulingContextCache"`
- `dotnet build src/backend/MES.Api/MES.Api.csproj --no-restore`
