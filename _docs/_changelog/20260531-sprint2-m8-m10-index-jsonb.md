# 2026-05-31 Sprint 2 M8-M10 索引与 JSONB

## 变更

- M8-M10：为核心查询形状补复合索引：
  - `WorkOrder` 列表过滤：`Status + WorkshopId + ProductCode + PlannedStartDate + PlannedEndDate`。
  - `WorkOrder` 车间排程查询：`WorkshopId + Priority + PlannedStartDate`。
  - `QualityInspection` 按工单/产品查询并按检验时间排序。
  - `StockTransaction` 按物料查询并按创建时间排序。
- M8-M10：将 `ScheduleAdoptionFeedback` 的 JSON 快照列显式配置为 PostgreSQL `jsonb`：
  - `OriginalAssignmentsJson`
  - `ModifiedAssignmentsJson`
  - `MovedOrderIdsJson`
- 新增架构测试 `M8ToM10CoreQueries_ShouldHaveCompositeIndexesAndJsonbColumns`，防止核心索引与 JSONB 配置回退。
- 新增迁移 `20260531120000_AddCoreCompositeIndexesAndJsonb`，对应索引与 `jsonb` 列类型调整。
- 同步 `MesDbContextModelSnapshot` 中的 M8-M10 索引与 `jsonb` 模型状态，避免后续迁移重复生成同一变更。

## 红灯证据

- 新增架构测试初次红灯：
  - `WorkOrder missing index (Status, WorkshopId, ProductCode, PlannedStartDate, PlannedEndDate)`
  - 结论：Sprint 2 M8-M10 点名的复合索引治理仍未覆盖核心工单列表查询形状。

## 验证

- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter "FullyQualifiedName~M8ToM10CoreQueries_ShouldHaveCompositeIndexesAndJsonbColumns" --no-restore`
  - 红灯确认后修复通过：1/1
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore`
  - 通过：14/14
- `dotnet build src/backend/MES.Api/MES.Api.csproj --no-restore`
  - 通过：0 warnings / 0 errors
- `MesDbContextModelSnapshot` 固定字符串复核：
  - 已包含 5 个 M8-M10 复合索引与 3 个 `jsonb` 列类型。

## 备注

- 本轮聚焦 Sprint 2 核心业务查询，不把 Agent 前序未跟踪模型配置纳入 M8-M10 结论。
- 迁移为手写迁移，避免再次让 EF 生成器把前序模型快照漂移混进本轮主体迁移；快照仅同步本轮必要模型状态。
