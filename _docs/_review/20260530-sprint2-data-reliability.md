# 2026-05-30 Sprint 2 数据可靠性审计

## 范围

来源计划：`C:\AIWorks\AIMes\_docs\_plan\20260514-cc-remediation-plan.md` 的 Sprint 2 / 2.1 H11 与 2.2 H12。

执行仓库：`C:\AIWorks\AIMes\v1`。

## 当前结论

- 2.1 / H11：已完成当前计划口径的核心仓储 no-tracking 覆盖。9 个核心仓储文件均在门禁范围内，普通读查询均直接 `AsNoTracking()` 或委托到已受控读方法。
- 显式例外：`QualityInspectionRepository.GetForUpdateAsync` 为更新场景保留 EF tracking，不属于 H11 no-tracking 读模型。
- 2.2 / H12：代码形态已满足 `AsSplitQuery()`、分页参数、主键稳定排序和仓储层 `Skip/Take`；架构门禁与 SQLite 关系型 SQL 日志测试均已覆盖该要求。
- 既有 NuGet 漏洞审计阻断已处理；Semantic Kernel embedding obsolete API 已迁移到 `Microsoft.Extensions.AI.IEmbeddingGenerator<string, Embedding<float>>`。

## 审计要点

| 项 | 证据 | 状态 |
|---|---|---|
| AsNoTracking 门禁有效性 | 原门禁 12 行窗口误绿；修正为完整方法体解析后先红 | 通过 |
| BomRepository.GetByIdAsync | 增加 `.AsNoTracking()` 后门禁转绿 | 通过 |
| 委托读取误报 | `EquipmentRepository.GetStateAsync` 委托 `GetByIdAsync`，门禁允许同仓储受控读方法 | 通过 |
| 核心仓储覆盖 | `CoreRepositories_ShouldBeCoveredByAsNoTrackingGate` 明确 Anomaly/Bom/Employee/Equipment/Material/PurchaseOrder/QualityInspection/Schedule/WorkOrder 9 个仓储文件均被扫描 | 通过 |
| 跟踪读取例外 | `QualityInspectionRepository.GetForUpdateAsync` 用于更新前取 tracking 实体，按方法名和用途排除在 H11 普通读模型之外 | 通过 |
| H12 接口分页 | `IScheduleRepository.GetAllAsync(int page = 1, int pageSize = 20, CancellationToken ct = default)` | 通过 |
| H12 SplitQuery | `ScheduleRepository.GetAllAsync` 查询链包含 `.AsSplitQuery()` | 通过 |
| H12 稳定排序 | `OrderByDescending(p => p.CreatedAt).ThenBy(p => p.Id)` 明确主键 tie-breaker | 通过 |
| H12 仓储分页 | 查询链包含 `.Skip((page - 1) * pageSize).Take(pageSize)` | 通过 |
| H12 SQL 日志验证 | `ScheduleRepositoryTests.GetAllAsync_UsesSplitQueryAndStablePagedOrdering` 使用 SQLite in-memory 捕获 `CommandExecuted` 日志；临时移除 `.AsSplitQuery()` 先红，恢复后转绿 | 通过 |
| 依赖审计阻断 | 升级 `Azure.Identity` / `Microsoft.Identity.Client` / Semantic Kernel，并迁移 obsolete embedding API | 通过 |

## 验证

- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter "FullyQualifiedName~RepositoryReadQueries_ShouldUseAsNoTracking" --no-restore`：先失败，指向 `BomRepository.GetByIdAsync`。
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter "FullyQualifiedName~RepositoryReadQueries_ShouldUseAsNoTracking" --no-restore`：修复后 1 passed。
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore`：6 passed。
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore`：7 passed。
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore`：360 passed。
- H12 先红：`dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter "FullyQualifiedName~ScheduleRepositoryGetAll_ShouldUseSplitQueryStableOrderingAndPaging" --no-restore`：1 failed，指向接口缺少分页参数。
- H12 修复后：同一 H12 定向架构测试 1 passed。
- H12 修复后：`dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore`：8 passed。
- H12 修复后：`dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore`：360 passed。
- H12 后续复核：`dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-build --no-restore`：8 passed。
- H12 后续复核：`dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-build --no-restore`：360 passed。
- H12 依赖治理红灯：升级 Semantic Kernel 后，`dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore` 先因 obsolete embedding API 编译失败。
- H12 依赖治理修复后：`dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore`：8 passed。
- H12 依赖治理修复后：`dotnet restore src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj` 成功；`dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore`：360 passed。
- H12 SQL 日志测试：临时移除 `.AsSplitQuery()` 后，`dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --no-restore --filter "FullyQualifiedName~ScheduleRepositoryTests"`：1 failed，指向每页 SQL 命令数不足。
- H12 SQL 日志测试恢复后：同一命令 1 passed。
- `git diff --check` 限定 H12 文件：无空白错误，仅 LF/CRLF 提示。

## 边界

- `ScheduleRepository.GetAllAsync` 的 `AsSplitQuery()`、分页参数和稳定排序已在 H12 处理，并通过架构门禁与 SQLite 关系型日志测试双通道验证。
- SQL 日志测试为仓储级 in-memory SQLite 验证，不替代 PostgreSQL/SQL Server 生产库压测；它覆盖本次 H12 关注的 EF 查询拆分形态与稳定分页意图。

## H12 本地双通道审查

- code-reviewer lane：未发现 H12 代码层 HIGH/CRITICAL。`GetAllAsync` 变更范围集中，旧无参调用保留默认参数兼容，Moq setup 已同步。
- architect lane：未发现 H12 HIGH/CRITICAL。SQL 日志证据已补齐；剩余边界是该测试使用 SQLite provider，不覆盖生产库执行计划。
- 最终建议：PASS。H12 可进入下一步；生产库级执行计划观察可作为后续性能/灰度观察项。

## H13 审计补充

来源计划：Sprint 2 / 2.3 H13，`SchedulingAppService.GetWorkOrdersAsync` 改数据库分页。

| 项 | 证据 | 状态 |
|---|---|---|
| AppService 不再拉全量分页 | `GetWorkOrdersAsync` 调用 `_workOrderRepo.CountAsync(...)` 与 `_workOrderRepo.GetPagedAsync(...)`，只在返回页内做 DTO 映射 | 通过 |
| 过滤条件下沉仓储 | `GetPagedAsync` / `CountAsync` 参数覆盖 `status/workshopId/productCode/startDate/endDate` | 通过 |
| 仓储读查询 no-tracking | `BuildListQuery` 统一从 `_context.WorkOrders.AsNoTracking()` 起步；架构门禁已允许并验证该 helper 模式 | 通过 |
| 稳定数据库分页 | `WorkOrderRepository.GetPagedAsync` 使用 `Priority desc + PlannedStartDate + Id`，再执行 `Skip/Take` | 通过 |
| 回退防护 | `ListAppServices_ShouldUseRepositoryPaging` 已加入 `SchedulingAppService.GetWorkOrdersAsync`，防止重新使用 `_workOrderRepo.GetAllAsync` 和内存 `Skip/Take` | 通过 |
| SQL 证据 | `WorkOrderRepositoryTests.GetPagedAsync_FiltersAndUsesStableDatabasePaging` 捕获关系型 SQL，验证 `COUNT`、`ORDER BY priority/planned_start_date/id` 与 `LIMIT` | 通过 |

## H13 验证

- H13 架构红灯：新增 Scheduling 检查后，`ListAppServices_ShouldUseRepositoryPaging` 失败，指向 `missing GetPagedAsync`。
- H13 单元红灯：新增 `GetWorkOrdersAsync_ShouldUseRepositoryPagingWithFilters` 后，编译失败指向仓储接口缺少 `GetPagedAsync` 与匹配 `CountAsync`。
- H13 绿灯：`dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore --filter "FullyQualifiedName~SchedulingAppServiceTests.GetWorkOrdersAsync_ShouldUseRepositoryPagingWithFilters"`：1 passed。
- H13 绿灯：`dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore --filter "FullyQualifiedName~ListAppServices_ShouldUseRepositoryPaging"`：1 passed。
- H13 绿灯：`dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --no-restore --filter "FullyQualifiedName~WorkOrderRepositoryTests"`：1 passed。
- H13 完整架构复核：`dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore`：8 passed。
- H13 完整单元复核：`dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore`：361 passed。
- H13 相关集成复核：`dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --no-restore --filter "FullyQualifiedName~WorkOrderRepositoryTests|FullyQualifiedName~ScheduleRepositoryTests"`：2 passed。

## H13 边界

- 该集成测试使用 SQLite in-memory 验证 EF 关系型 SQL 形态，不替代 PostgreSQL/SQL Server 生产执行计划观察。
- 本轮仅覆盖 `SchedulingAppService.GetWorkOrdersAsync`。计划中分页返回精确 page size 还需继续检查 Equipment/Admin 列表接口。
- 一次并行运行 Unit 与 Architecture 测试触发 `MES.Domain.dll` 文件锁；后续已按项目约束串行复跑通过，不计为代码缺陷。
