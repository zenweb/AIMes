# 2026-05-31 Sprint 2 B4 Inventory 事务修复

## 变更

- B4：`EfUnitOfWork` 在关系型事务内统一执行 `SaveChangesAsync` 后再提交事务；InMemory provider 继续跳过事务外壳，但同样由 UoW 统一保存。
- B4：`MaterialRepository.UpdateAsync` 不再自行 `SaveChangesAsync`，只将物料变更挂到 EF change tracker。
- B4：`StockTransactionRepository.AddAsync` 不再自行 `SaveChangesAsync`，只登记库存流水新增实体。
- B4：`InventoryAppService` 出入库、转移、调整路径将 `CancellationToken` 传播到物料读取和更新仓储。
- 架构测试新增 `InventoryTransactionRepositories_ShouldNotCommitInsideRepositoryMethods`，防止 Inventory 事务边界内仓储重新自提交。
- 新增 SQLite 关系型集成测试 `InventoryTransactionRepositoryTests`：
  - 成功路径：`StockOutAsync` 由 UoW 一次性提交物料扣减和库存流水。
  - 失败路径：库存流水写入抛错时，物料扣减不落库，流水也不落库。

## 红灯证据

- 新增架构测试初次红灯：
  - `InventoryTransactionRepositories_ShouldNotCommitInsideRepositoryMethods`
  - 失败现象：`MaterialRepository.UpdateAsync` 在 Inventory 事务边界内仍调用 `SaveChangesAsync`。
  - 结论：实现违反计划中“纳入事务的仓储不得在方法内部各自调 SaveChangesAsync”的 B4 约束。

## 验证

- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter "FullyQualifiedName~InventoryTransactionRepositories_ShouldNotCommitInsideRepositoryMethods" --no-restore`
  - 红灯确认后修复通过：1/1
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --filter "FullyQualifiedName~InventoryTransactionRepositoryTests" --no-restore`
  - 通过：2/2
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --filter "FullyQualifiedName~InventoryAppServiceTests" --no-restore`
  - 通过：10/10
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --filter "FullyQualifiedName~InventoryControllerTests|FullyQualifiedName~InventoryTransactionRepositoryTests|FullyQualifiedName~AnomalyTransactionTests" --no-restore`
  - 通过：10/10
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore`
  - 通过：9/9
- `git diff --check -- <本次触达文件>`
  - 通过；仅有 Git 的 LF/CRLF 工作区提示。

## 备注

- 一次并行跑架构测试和集成测试时触发 `MES.Application.dll` 文件锁；已按项目约束改为串行重跑，业务测试通过。
- `MaterialRepository.UpdateAsync` 当前检索到的生产调用点仅为 `InventoryAppService` 写路径，本轮未扩大其它业务写入口的提交语义。
