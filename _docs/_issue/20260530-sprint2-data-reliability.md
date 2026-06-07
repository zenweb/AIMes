# 2026-05-30 Sprint 2 数据可靠性问题记录

## S2-H11：仓储读查询 AsNoTracking 覆盖不足

- 计划项：2.1 / H11。
- 初始测试状态：`RepositoryReadQueries_ShouldUseAsNoTracking` 通过，但测试只检查读方法签名后 12 行，可能把后续方法里的 `AsNoTracking` 误算为当前方法覆盖。
- 先红：
  - 修正为完整方法体解析后，门禁暴露 `BomRepository.GetByIdAsync` 缺少 `AsNoTracking()`。
- 修复：
  - `ArchitectureRuleTests.FindReadMethodsWithoutAsNoTracking` 改为提取完整方法体。
  - 门禁允许委托到同仓储已受控读方法，避免误伤 `GetStateAsync -> GetByIdAsync`。
  - 新增核心仓储覆盖清单断言，确保 9 个核心仓储文件均被 H11 门禁扫描。
  - `BomRepository.GetByIdAsync` 增加 `.AsNoTracking()`。
- 验证：
  - H11 定向架构测试 1 passed。
  - 完整 ArchitectureTests 6 passed。
  - 完整 ArchitectureTests 7 passed。
  - 完整 Unit 项目 360 passed。
  - 9 个核心仓储普通读查询均核对为直接 `AsNoTracking()` 或委托到已受控读方法。

## 剩余风险

- `QualityInspectionRepository.GetForUpdateAsync` 是更新用 tracking 查询，需保持为显式例外，后续不要误改为 no-tracking。
- H12 SQL 分离查询已用 SQLite 关系型 provider 验证；仍建议后续灰度/性能阶段观察生产库执行计划与真实数据量下的 IO 表现。

## S2-H12：ScheduleRepository.GetAllAsync 缺少 SplitQuery / 稳定分页

- 计划项：2.2 / H12。
- 初始状态：
  - `IScheduleRepository.GetAllAsync` 仅接受 `CancellationToken`。
  - `ScheduleRepository.GetAllAsync` 使用 `Include(p => p.Items)` + `OrderByDescending(p => p.CreatedAt)` + `ToListAsync(ct)`，缺少 `AsSplitQuery()`、分页参数、主键 tie-breaker 和仓储层 `Skip/Take`。
- 先红：
  - 新增 `ScheduleRepositoryGetAll_ShouldUseSplitQueryStableOrderingAndPaging` 后，定向架构测试失败，指向接口未暴露 `page/pageSize`。
- 修复：
  - `IScheduleRepository.GetAllAsync` 改为 `GetAllAsync(int page = 1, int pageSize = 20, CancellationToken ct = default)`。
  - `ScheduleRepository.GetAllAsync` 增加 `.AsSplitQuery()`。
  - `ScheduleRepository.GetAllAsync` 排序改为 `.OrderByDescending(p => p.CreatedAt).ThenBy(p => p.Id)`。
  - `ScheduleRepository.GetAllAsync` 增加 `.Skip((page - 1) * pageSize).Take(pageSize)`。
  - 同步 `SchedulingAppServiceTests` 的 Moq setup。
- 验证：
  - H12 定向架构测试先红后绿。
  - ArchitectureTests 后续 8 passed。
  - Unit 后续 360 passed。
  - `git diff --check` 限定 H12 文件无空白错误。
- SQL 日志验证：
  - 新增 `ScheduleRepositoryTests.GetAllAsync_UsesSplitQueryAndStablePagedOrdering`，使用 SQLite in-memory 捕获 `RelationalEventId.CommandExecuted`。
  - 先红：临时移除 `.AsSplitQuery()` 后测试失败，指出每页 SQL 命令数不足。
  - 恢复后：同一测试 1 passed。

## S2-BLOCKER：既有 NuGet 漏洞审计阻断常规 restore/build/test

- 现象：
  - `dotnet restore src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj` 失败。
  - `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore` 在后续复核中失败。
- 证据：
  - `Azure.Identity` 1.10.4：`NU1902`，GHSA-m5vv-6r4h-3vj9 / GHSA-wvxc-855f-jvrv。
  - `Microsoft.Identity.Client` 4.56.0：`NU1901/NU1902`，GHSA-x674-v45j-fwxw / GHSA-m5vv-6r4h-3vj9。
  - `Microsoft.SemanticKernel.Core` 1.45.0：`NU1904`，GHSA-2ww3-72rp-wpp4。
  - 根配置 `Directory.Build.props` 设置 `TreatWarningsAsErrors=true`，且当前只 suppress `NU1903/NU1510`。
- 修复：
  - `Directory.Packages.props` 升级 `Azure.Identity` 到 1.11.4、`Microsoft.Identity.Client` 到 4.61.3、Semantic Kernel 相关包到 1.71.0。
  - `MES.AI.csproj` 显式引用 `Azure.Identity` 与 `Microsoft.Identity.Client`，避免传递旧版本继续进入 restore 图。
  - `LlmGatewayService` 迁移到 `Microsoft.Extensions.AI.IEmbeddingGenerator<string, Embedding<float>>`，替换 obsolete `ITextEmbeddingGenerationService` 与 `Add*TextEmbeddingGeneration`。
- 验证：
  - `dotnet restore src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj` 成功。
  - `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore`：8 passed。
  - `dotnet restore src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj` 成功。
  - `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore`：360 passed。
- 状态：
  - 已解除本轮 H12 验证阻断。

## S2-H13：SchedulingAppService.GetWorkOrdersAsync 内存分页

- 计划项：2.3 / H13。
- 初始状态：
  - `SchedulingAppService.GetWorkOrdersAsync` 通过 `_workOrderRepo.GetAllAsync(status)` 拉回状态下所有工单。
  - `WorkshopId/ProductCode/StartDate/EndDate` 过滤、`Count()`、排序与 `Skip/Take` 均在 AppService 内存集合上执行。
- 先红：
  - `ListAppServices_ShouldUseRepositoryPaging` 加入 Scheduling 检查后失败，指向 `missing GetPagedAsync`。
  - `GetWorkOrdersAsync_ShouldUseRepositoryPagingWithFilters` 加入后编译失败，指向 `IWorkOrderRepository` 缺少 `GetPagedAsync` 与匹配 `CountAsync`。
- 修复：
  - `IWorkOrderRepository` 新增 `GetPagedAsync` 与 `CountAsync`。
  - `WorkOrderRepository` 新增 `BuildListQuery`，统一 `AsNoTracking()` 与过滤条件。
  - `WorkOrderRepository.GetPagedAsync` 在数据库查询中执行稳定排序和 `Skip/Take`。
  - `SchedulingAppService.GetWorkOrdersAsync` 改为先取 `CountAsync`，再取当前页 `GetPagedAsync`，只映射当前页 DTO。
  - 修正架构测试方法体提取逻辑，避免接口声明误命中。
  - 扩展 AsNoTracking 门禁，允许委托到同仓储内含 `AsNoTracking()` 的私有 query helper。
- 验证：
  - H13 定向单元测试 1 passed。
  - H13 定向架构测试 1 passed。
  - H13 仓储 SQLite SQL 日志测试 1 passed。
  - ArchitectureTests 8 passed。
  - Unit 361 passed。
  - WorkOrder/Schedule 相关 Integration 2 passed。

## S2-H13 验证噪声：并行测试文件锁

- 现象：
  - 同时运行 Unit 与 Architecture 定向测试时，Architecture 测试编译失败：无法写入 `MES.Domain\obj\Debug\net10.0\MES.Domain.dll`，文件被另一进程占用。
- 根因：
  - 本仓库测试项目共享输出依赖，且当前规则要求串行跑测试；并行触发文件锁属于执行方式问题。
- 处理：
  - 改为串行复跑，相关测试均通过。
- 状态：
  - 非代码缺陷；后续验证继续串行执行。
