# 2026-05-31 Sprint 5 H5 Domain NotMapped

## 变更

- 移除 Domain 实体中的 EF `[NotMapped]` 注解与 `System.ComponentModel.DataAnnotations.Schema` 引用。
- 保留 Infrastructure Fluent API 的忽略配置：
  - `WorkOrder.CustomFields`
  - `DocumentChunk.Metadata`
  - `DocumentChunk.Vector`
  - `EquipmentTelemetry.Parameters`
  - `QualityInspection.MeasurementData`
- 新增架构/模型门禁 `H5DomainEntities_ShouldNotUseNotMappedAnnotationsAndFluentApiShouldIgnoreRuntimeProperties`。

## 验证

- 红灯：新增门禁曾因 Domain 实体仍引用 `System.ComponentModel.DataAnnotations.Schema` / `[NotMapped]` 失败。
- 绿灯：`dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore --filter "FullyQualifiedName~H5DomainEntities"` 通过，`1/1 passed`。
- `dotnet build src/backend/MES.Api/MES.Api.csproj --no-restore` 通过，`0 warning / 0 error`。
