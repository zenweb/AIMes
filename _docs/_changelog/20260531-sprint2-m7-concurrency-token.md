# 2026-05-31 Sprint 2 M7 并发令牌

## 变更

- M7：`EquipmentConfiguration` 增加 `UseProviderShadowConcurrencyToken()`。
- 新增 EF 迁移 `20260530174426_AddEquipmentConcurrencyToken`，为 `equipment` 表补 `xmin` 并发列。
- 新增架构测试 `M7TargetEntities_ShouldConfigureConcurrencyTokens`，检查 `WorkOrder`、`Equipment`、`Material`、`SchedulePlan` 在 EF 模型中都有并发令牌。

## 红灯证据

- 新增架构测试初次红灯：
  - `Equipment missing EF concurrency token`
  - 结论：M7 点名的四个实体中，`WorkOrder`、`Material`、`SchedulePlan` 已有 provider shadow token，`Equipment` 漏配。

## 验证

- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter "FullyQualifiedName~M7TargetEntities_ShouldConfigureConcurrencyTokens" --no-restore`
  - 红灯确认后修复通过：1/1
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore`
  - 通过：13/13
- `dotnet build src/backend/MES.Api/MES.Api.csproj --no-restore`
  - 通过：0 warnings / 0 errors

## 备注

- 迁移主体只新增/删除 `equipment.xmin`。
- `MesDbContextModelSnapshot` 在生成迁移时同步了当前模型状态；工作树中已有前序未跟踪迁移和模型漂移，本轮没有回滚这些既有状态。
