# 2026-05-31 Sprint 2 B4 Purchase 事务修复

## 变更

- B4：`PurchaseAppService` 注入 `IUnitOfWork`，将 `CreateAsync`、`SubmitAsync`、`ConfirmAsync`、`ReceiveAsync`、`CancelAsync` 写路径包入统一事务边界。
- B4：`PurchaseOrderRepository.AddAsync/UpdateAsync` 不再自行 `SaveChangesAsync`，只将采购单新增/更新挂到 EF change tracker。
- B4：`ScheduleAgentService.ExecutePurchaseWriteAsync` 的采购执行写路径改为使用 `IUnitOfWork`，避免仓储取消自提交后 Agent 执行结果不落库。
- 架构测试新增 `PurchaseWrites_ShouldUseUnitOfWorkAndRepositoriesShouldNotSelfCommit`：
  - Purchase 写服务必须依赖 UoW。
  - Purchase 五个写方法必须各自包入 `_unitOfWork.ExecuteAsync`。
  - `PurchaseOrderRepository.AddAsync/UpdateAsync` 不得出现 `SaveChangesAsync`。
- 新增 SQLite 关系型集成测试 `PurchaseTransactionRepositoryTests`，验证 `SubmitAsync` 由 UoW 提交采购单状态。

## 红灯证据

- 新增架构测试初次红灯：
  - `PurchaseWrites_ShouldUseUnitOfWorkAndRepositoriesShouldNotSelfCommit`
  - 失败现象：`PurchaseAppService` 未使用 `IUnitOfWork`。
  - 结论：Purchase 关键聚合未满足 B4 “统一事务提交点”约束。

## 验证

- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter "FullyQualifiedName~PurchaseWrites_ShouldUseUnitOfWorkAndRepositoriesShouldNotSelfCommit" --no-restore`
  - 红灯确认后修复通过：1/1
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --filter "FullyQualifiedName~PurchaseTransactionRepositoryTests" --no-restore`
  - 通过：1/1
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --filter "FullyQualifiedName~PurchaseAppServiceTests" --no-restore`
  - 通过：10/10
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --filter "FullyQualifiedName~PurchaseTransactionRepositoryTests|FullyQualifiedName~PurchaseControllerTests|FullyQualifiedName~AgentExecutePurchaseAction_WithReceiptPayload_ShouldReceivePurchaseOrderAndAuditBusinessWrite" --no-restore`
  - 通过：9/9
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore`
  - 通过：10/10
- `git diff --check -- <本次触达文件>`
  - 通过；仅有 Git 的 LF/CRLF 工作区提示。

## 备注

- 本轮聚焦 Purchase 聚合数据库提交点统一，不把端点通知失败回滚/Outbox 扩进本切片。
- `PurchaseAppService.GetAllAsync` 的仓储分页属于前序 H13 改动，本轮未以 Purchase B4 为由扩大分页范围。
