# 2026-05-31 Sprint 3 审计事务分层 Review

## 结论

- 审计分层已落地：
  - 合规状态变更审计进入业务事务。
  - 通用操作追踪继续由 `AuditEndpointFilter` 在业务事务外写入，允许最终一致。
- `AuditLogRepository` 不再自提交，避免内联审计绕过 `IUnitOfWork`。

## 风险

- 内联审计的 `userId` 目前来自业务请求里的操作者字段或创建人，未统一接入当前 `ClaimsPrincipal`；这符合应用服务层不依赖 HTTP 的边界，但后续如需强合规主体，应引入应用层 actor context。
- Endpoint filter 仍会为同一写操作额外写一条事务外追踪记录；这是刻意分层，不是重复替代。
- 集成测试首次复跑时暴露 `MES.Api.csproj` 对不存在的 `wwwroot/scheduling` 执行 `RemoveDir` 会失败；已改为存在时再删除。

## 已验证

- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore --filter Sprint3StateChangingAudit_ShouldBeWrittenInsideBusinessUnitOfWork`
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore --filter "FullyQualifiedName~PurchaseAppService|FullyQualifiedName~InventoryAppService"`
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --no-restore --filter "FullyQualifiedName~PurchaseTransactionRepositoryTests|FullyQualifiedName~InventoryTransactionRepositoryTests"`
