# 2026-05-30 Sprint 2 后续待办

## 已完成

- [x] 2.1 / H11 小步：修正 AsNoTracking 架构门禁的 12 行误绿问题。
- [x] 2.1 / H11 小步：`BomRepository.GetByIdAsync` 增加 `AsNoTracking()`。
- [x] 2.1 / H11：9 个核心仓储文件均被 AsNoTracking 门禁覆盖。
- [x] 2.1 / H11：核心仓储普通读查询均为 `AsNoTracking()` 或委托到已受控读方法；`GetForUpdateAsync` 作为更新用 tracking 例外记录。
- [x] 2.2 / H12 小步：`ScheduleRepository.GetAllAsync` 增加 `AsSplitQuery()`、分页参数、显式稳定 `OrderBy` 和仓储层 `Skip/Take`。
- [x] 2.2 / H12 小步：新增架构门禁覆盖接口分页、SplitQuery、稳定排序和仓储分页。
- [x] 处理既有 NuGet 漏洞审计阻断：升级 `Azure.Identity`、`Microsoft.Identity.Client` 与 Semantic Kernel 相关包。
- [x] 迁移 `LlmGatewayService` embedding API，解除 Semantic Kernel 1.71 obsolete API 在 `TreatWarningsAsErrors=true` 下的编译阻断。
- [x] 补跑 H12 关系型 SQL 日志验证：新增 SQLite in-memory 仓储测试，确认 `ScheduleRepository.GetAllAsync` 对 `Items` Include 发出分离查询，并覆盖稳定分页。
- [x] 2.3 / H13 小步：`SchedulingAppService.GetWorkOrdersAsync` 改用 `IWorkOrderRepository.CountAsync` + `GetPagedAsync`，不再拉全量后内存过滤/分页。
- [x] 2.3 / H13 小步：`WorkOrderRepository.GetPagedAsync` 在数据库层应用过滤、稳定排序和 `Skip/Take`，并新增 SQLite 关系型 SQL 日志验证。

## P0 下一步

- [x] 继续 Sprint 2 / H13 剩余分页面：Equipment/Admin 列表接口已改为仓储分页与计数，`GetAllUsersAsync` / `GetEquipmentsAsync` 通过 `GetPagedAsync` + `CountAsync` 返回精确 `pageSize`，架构门与单测/集成测试均复核通过。

## P1

- [x] 结合 C6 非阻断观察，明确 `QualityAgent` fallback 在生产质检中的 fail-open / fail-closed 策略：已确定为 fail-closed。

## 回归命令

- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter "FullyQualifiedName~RepositoryReadQueries_ShouldUseAsNoTracking" --no-restore`
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter "FullyQualifiedName~ScheduleRepositoryGetAll_ShouldUseSplitQueryStableOrderingAndPaging" --no-restore`
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter "FullyQualifiedName~ListAppServices_ShouldUseRepositoryPaging" --no-restore`
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore`
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore`
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --filter "FullyQualifiedName~ScheduleRepositoryTests" --no-restore`
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --filter "FullyQualifiedName~WorkOrderRepositoryTests|FullyQualifiedName~ScheduleRepositoryTests" --no-restore`
