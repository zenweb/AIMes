# 2026-06-12 Changelog：排产拖拽保存后端持久化证据

## 变更

- 为 `PATCH /api/v1/scheduling/plans/{planId}/items/{itemId}` 增加集成测试。
- 测试直接 seed 带排产项的计划，执行拖拽窗口 PATCH 后：
  - 使用新的 `MesDbContext` 从数据库读取并断言 `PlannedStartTime/PlannedEndTime` 已更新。
  - 再通过 `GET /api/v1/scheduling/plans/{planId}` 断言读模型返回同一时间窗口。
- 扩展测试 DTO，读取 `SchedulePlanResponse.Items` 中的排产项窗口。

## 验证

- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --filter "FullyQualifiedName~SchedulingControllerTests.RescheduleItem_WhenSaved_ShouldPersistDraggedWindowToDatabaseAndPlanReadModel"`：通过。
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --filter "FullyQualifiedName~SchedulingControllerTests"`：62 passed。

## 说明

- 本片未修改生产代码。当前实现已能持久化拖拽窗口，本次补齐后端持久化级证据。
