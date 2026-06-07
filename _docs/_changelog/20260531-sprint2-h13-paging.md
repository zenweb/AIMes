# 2026-05-31 Sprint 2 H13 分页修复

## 变更

- H13：`EquipmentAppService.GetEquipmentsAsync` 改为调用 `IEquipmentRepository.GetPagedAsync/CountAsync`，不再在应用层拉全量后 `Skip/Take`。
- H13：`AdminAppService.GetAllUsersAsync` 改为调用 `IUserRepository.GetPagedAsync/CountAsync`，不再在应用层内存分页。
- 仓储层新增设备、用户分页查询：
  - 设备分页支持 `workshopId` + `status` 过滤，`CountAsync` 与 `GetPagedAsync` 复用同一过滤构造。
  - 设备排序为 `WorkshopId -> EquipmentCode -> Id`，用户排序为 `Username -> Id`，确保分页稳定。
  - 读查询保持 `AsNoTracking()`。
- 应用服务边界新增分页参数防御：`page < 1` 或 `pageSize < 1` 在进入仓储前抛 `ArgumentOutOfRangeException`，避免坏分页和 `TotalPages` 除零。
- 架构测试 `ListAppServices_ShouldUseRepositoryPaging` 纳入 Equipment/Admin，防止回退到服务层内存分页。
- 新增仓储集成测试 `PagingRepositoryTests`，验证设备/用户分页由 SQL `COUNT`/`ORDER BY`/`LIMIT` 执行。

## 验证

- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore`
  - 通过：8/8
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --filter "FullyQualifiedName~EquipmentAppServiceTests|FullyQualifiedName~AdminAppServiceTests|FullyQualifiedName~SchedulingAppServiceTests" --no-restore`
  - 通过：30/30
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --filter "FullyQualifiedName~PagingRepositoryTests|FullyQualifiedName~WorkOrderRepositoryTests|FullyQualifiedName~ScheduleRepositoryTests" --no-restore`
  - 通过：4/4
- `git diff --check -- <本次触达文件>`
  - 通过；仅有 Git 的 LF/CRLF 工作区提示。

## 备注

- 当前工作树存在大量既有未提交/未跟踪改动。本次变更只围绕 H13 Equipment/Admin 分页闭环，未清理或回滚无关改动。
