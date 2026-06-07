# 2026-05-31 Sprint 2 M5 领域实体 Setter 收紧

## 变更

- M5：将 `Material` 的公开属性 setter 从 `internal set` 收紧为 `private set`。
- 保持 `QualityInspection` 与 `SchedulePlan` 现有 `private set` 约束不变。
- 将受影响的单元测试、集成测试种子与库存/扫码集成测试数据改为通过 `Material.Create(...)` 和 `Reserve(...)` 构造领域状态。
- 新增架构测试 `M5TargetDomainEntities_ShouldNotExposeInternalSetters`，防止 `Material`、`QualityInspection`、`SchedulePlan` 回退为 `internal set`。

## 红灯证据

- 新增 M5 架构测试初次红灯：
  - 命中 `Material` 多个属性仍暴露 `internal set`。
  - 结论：计划点名的 `Material` 聚合仍允许程序集内绕过领域行为直接改状态。
- 收紧后首次集成测试编译红灯：
  - `TestDataSeedFilter.cs` 仍使用 `new Material { ... }` 直接赋值。
  - 处理：改为领域工厂与行为方法表达同一测试数据。

## 验证

- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter "FullyQualifiedName~M5TargetDomainEntities_ShouldNotExposeInternalSetters" --no-restore`
  - 红灯确认后修复通过：1/1
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --filter "FullyQualifiedName~InventoryControllerTests|FullyQualifiedName~ScanControllerTests|FullyQualifiedName~InventoryTransactionRepositoryTests" --no-restore`
  - 通过：12/12
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore`
  - 通过：12/12
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --filter "FullyQualifiedName~MaterialTests|FullyQualifiedName~QualityInspectionTests|FullyQualifiedName~SchedulePlanTests|FullyQualifiedName~InventoryAppServiceTests" --no-restore`
  - 通过：27/27

## 备注

- `ExpiryDate` 当前没有公开领域行为设置入口；本轮没有新增业务能力，只把原测试改为验证初始为空，避免为测试重新打开实体 setter。
