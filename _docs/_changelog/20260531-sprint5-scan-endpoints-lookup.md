# 2026-05-31 Sprint 5 5.9 ScanEndpoints Lookup

## 变更

- `ScanEndpoints` 扫码设备与工单时改为按 code/id 定点查询，不再 `GetAllAsync` 后内存 `FirstOrDefault`。
- `IEquipmentRepository` / `EquipmentRepository` 新增 `GetByCodeAsync`。
- `IWorkOrderRepository` / `WorkOrderRepository` 新增 `GetByCodeAsync`，同时支持工单号与 id。
- 新增架构门禁 `Sprint5ScanEndpoints_ShouldUseTargetedRepositoryLookups`，防止扫码接口回退到全表拉取。

## 验证

- 红灯：新增架构门禁曾因 `ScanEndpoints` 使用 `GetAllAsync + FirstOrDefault` 失败。
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore --filter "FullyQualifiedName~Sprint5ScanEndpoints"` 通过，`1/1 passed`。
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --no-restore --filter "FullyQualifiedName~ScanControllerTests"` 通过，`3/3 passed`。
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore --filter "FullyQualifiedName~EquipmentAppServiceTests|FullyQualifiedName~SchedulingAppServiceTests|FullyQualifiedName~QualityAppServiceTests"` 通过，`24/24 passed`。
- `dotnet build src/backend/MES.Api/MES.Api.csproj --no-restore` 通过，`0 warning / 0 error`。

## 范围说明

- 本轮只处理 Sprint 5 / 5.9 中 `ScanEndpoints` 的全表扫描优化。
- 5.9 死代码删除仍需继续审计。
