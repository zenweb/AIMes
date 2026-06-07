# 2026-05-30 Sprint 2 数据可靠性

## 完成

- 启动 2.1 / H11：修正 `MES.ArchitectureTests.RepositoryReadQueries_ShouldUseAsNoTracking` 的方法体解析，避免只扫描 12 行导致后续方法里的 `AsNoTracking` 误算到当前读方法。
- 通过修正后的架构门禁暴露真实红灯：`BomRepository.GetByIdAsync` 缺少 `AsNoTracking()`。
- 修复 `BomRepository.GetByIdAsync`，读查询改为 `AsNoTracking().FirstOrDefaultAsync(...)`。
- 架构门禁允许委托到同仓储已受控读方法，避免误伤 `EquipmentRepository.GetStateAsync -> GetByIdAsync` 这类读取包装。
- 补充 `CoreRepositories_ShouldBeCoveredByAsNoTrackingGate`，明确 9 个核心仓储文件均在 H11 门禁扫描范围内。
- 人工核对 9 个核心仓储读方法：普通读查询均为直接 `AsNoTracking()` 或委托到已受控读方法；`QualityInspectionRepository.GetForUpdateAsync` 是为更新取跟踪实体的显式例外，不纳入 H11 no-tracking 读模型。

## 验证

- 先红：`dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter "FullyQualifiedName~RepositoryReadQueries_ShouldUseAsNoTracking" --no-restore` 暴露 `BomRepository.GetByIdAsync` 缺少 `AsNoTracking()`。
- 修复后：`dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter "FullyQualifiedName~RepositoryReadQueries_ShouldUseAsNoTracking" --no-restore`：1 passed。
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore`：6 passed。
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore`：7 passed。
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore`：360 passed。

## 2026-05-30 H12 更新

- 启动 2.2 / H12：为 `ScheduleRepository.GetAllAsync` 增加分页参数 `page/pageSize`，默认 `page = 1`、`pageSize = 20`，保持旧无参调用兼容。
- `ScheduleRepository.GetAllAsync` 增加 `.AsSplitQuery()`，避免 `SchedulePlan` + `Items` 集合 Include 在分页场景下退化为单条大 JOIN。
- `ScheduleRepository.GetAllAsync` 增加稳定排序链：`OrderByDescending(p => p.CreatedAt).ThenBy(p => p.Id)`，保证 `CreatedAt` 相同时分页顺序有主键级 tie-breaker。
- `ScheduleRepository.GetAllAsync` 在仓储层执行 `.Skip((page - 1) * pageSize).Take(pageSize)`，避免调用方拉全量后内存分页。
- 更新 `SchedulingAppServiceTests` 中 `IScheduleRepository.GetAllAsync` 的 Moq setup，以匹配新签名。
- 新增架构门禁 `ScheduleRepositoryGetAll_ShouldUseSplitQueryStableOrderingAndPaging`，覆盖 H12 的接口签名、SplitQuery、稳定排序和仓储层分页。

## 2026-05-30 H12 验证

- 先红：`dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter "FullyQualifiedName~ScheduleRepositoryGetAll_ShouldUseSplitQueryStableOrderingAndPaging" --no-restore`：1 failed，指向 `IScheduleRepository.GetAllAsync` 未暴露 `page/pageSize`。
- 修复后：同一 H12 定向架构测试 1 passed。
- 修复后：`dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore`：8 passed。
- 修复后：`dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore`：360 passed。
- 后续复核：`dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-build --no-restore`：8 passed。
- 后续复核：`dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-build --no-restore`：360 passed。
- `git diff --check -- src/tests/MES.ArchitectureTests/ArchitectureRuleTests.cs src/backend/MES.Domain/Interfaces/Repositories/IScheduleRepository.cs src/backend/MES.Infrastructure/Repositories/ScheduleRepository.cs src/tests/MES.Tests.Unit/Application/SchedulingAppServiceTests.cs Directory.Packages.props src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj`：无空白错误，仅 LF/CRLF 提示。

## 2026-05-30 H12 验证边界

- 已处理既有 NuGet 漏洞审计阻断：升级 `Azure.Identity`、`Microsoft.Identity.Client` 与 Semantic Kernel 包到当前安全可 restore 的版本，并为 `MES.AI` 显式引用 Identity 依赖以覆盖传递旧版本。
- 为兼容 Semantic Kernel 1.71，将 `LlmGatewayService` 的 embedding 注册与调用从 obsolete `ITextEmbeddingGenerationService` / `Add*TextEmbeddingGeneration` 迁移到 `Microsoft.Extensions.AI.IEmbeddingGenerator<string, Embedding<float>>` / `Add*EmbeddingGenerator`。
- 为 Integration 测试项目加入 `Microsoft.EntityFrameworkCore.Sqlite`，新增 `ScheduleRepositoryTests.GetAllAsync_UsesSplitQueryAndStablePagedOrdering`，用 SQLite in-memory + `RelationalEventId.CommandExecuted` 捕获真实关系型 SQL。
- SQL 日志测试验证 `ScheduleRepository.GetAllAsync` 在 `Include(p => p.Items)` 下按页发出 split query，并验证 `CreatedAt` 相同时按 `Id` 稳定分页、跨页无重复。
- 先红：临时移除 `.AsSplitQuery()` 后，`ScheduleRepositoryTests.GetAllAsync_UsesSplitQueryAndStablePagedOrdering` 失败，指出每页 SQL 命令数不足。
- 恢复后：同一 SQL 日志测试 1 passed。

## 2026-05-30 H13 更新

- 启动 2.3 / H13：将 `SchedulingAppService.GetWorkOrdersAsync` 从拉全量后内存过滤/分页，改为调用 `IWorkOrderRepository.CountAsync` 与 `GetPagedAsync`。
- `IWorkOrderRepository` 新增按 `status/workshopId/productCode/startDate/endDate/page/pageSize` 查询的 `GetPagedAsync`，并新增同过滤条件的 `CountAsync`。
- `WorkOrderRepository` 新增共享 `BuildListQuery`，统一应用 `AsNoTracking()` 与列表过滤条件。
- `WorkOrderRepository.GetPagedAsync` 在仓储层执行稳定排序与分页：`OrderByDescending(w => w.Priority).ThenBy(w => w.PlannedStartDate).ThenBy(w => w.Id).Skip(...).Take(...)`。
- `WorkOrderRepository.GetAllAsync` 保留旧调用兼容，并补上 `ThenBy(w => w.Id)` 作为稳定排序兜底。
- `ArchitectureRuleTests.ListAppServices_ShouldUseRepositoryPaging` 加入 `SchedulingAppService.GetWorkOrdersAsync`，防止列表接口回退到 `_workOrderRepo.GetAllAsync` 与内存分页。
- 修正 `ArchitectureRuleTests.ExtractMethodBody`，跳过同文件接口声明，避免 `GetWorkOrdersAsync` 接口签名被误当作方法体起点。
- 扩展 `RepositoryReadQueries_ShouldUseAsNoTracking`，允许 public 读方法委托到同仓储内包含 `AsNoTracking()` 的私有 query helper。
- `SchedulingAppServiceTests` 新增 `GetWorkOrdersAsync_ShouldUseRepositoryPagingWithFilters`，验证过滤、分页、总数来源于仓储分页/计数接口，且不调用 `GetAllAsync`。
- 新增 `WorkOrderRepositoryTests.GetPagedAsync_FiltersAndUsesStableDatabasePaging`，使用 SQLite in-memory 捕获关系型 SQL，验证过滤、总数、精确 page size、跨页无重复和 SQL 层稳定分页。

## 2026-05-30 H13 验证

- 先红：新增 Scheduling 架构门禁后，`ListAppServices_ShouldUseRepositoryPaging` 失败，指向 `SchedulingAppService.GetWorkOrdersAsync: missing GetPagedAsync`。
- 先红：新增单元测试后，`dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore --filter "FullyQualifiedName~SchedulingAppServiceTests.GetWorkOrdersAsync_ShouldUseRepositoryPagingWithFilters"` 编译失败，指向 `IWorkOrderRepository` 缺少 `GetPagedAsync` 与匹配的 `CountAsync`。
- 修复后：同一单元测试 1 passed。
- 修复后：`dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore --filter "FullyQualifiedName~ListAppServices_ShouldUseRepositoryPaging"` 1 passed。
- 首次 H13 集成测试红灯：`WorkOrderRepositoryTests` 因测试环境 provider 未设置，`EnsureCreatedAsync` 触发 `materials.xmin` SQLite 非空约束；沿用 H12 测试模式设置 `AIMES_DATABASE_PROVIDER=SqlServer` 后解除。
- 修复后：`dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --no-restore --filter "FullyQualifiedName~WorkOrderRepositoryTests"` 1 passed。
- 完整架构复核：`dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore`：8 passed。
- 完整单元复核：`dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore`：361 passed。
- 相关集成复核：`dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --no-restore --filter "FullyQualifiedName~WorkOrderRepositoryTests|FullyQualifiedName~ScheduleRepositoryTests"`：2 passed。
