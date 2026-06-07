# 2026-05-31 Sprint 5 H2 Export Infrastructure

## 变更

- 确认 `MES.Application` 只保留 `IExportAppService` 接口，不引用 `ClosedXML` / `QuestPDF`。
- 确认 `MES.Infrastructure` 持有 `ExportAppService` 具体实现，并拥有 `ClosedXML` / `QuestPDF` 包引用。
- `ServiceCollectionExtensions` 的 DI 注册改为显式别名 `InfrastructureExportAppService`，避免未来同名类回退到 Application 层实现。
- 新增架构测试 `ExportRendering_ShouldLiveInInfrastructureAndBeRegisteredExplicitly`，覆盖项目引用、接口/实现位置、渲染库位置和 DI 绑定。

## 验证

- 红灯：新增门禁曾因 DI 未显式绑定 `MES.Infrastructure.Services.ExportAppService` 失败。
- 绿灯：`dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore --filter "FullyQualifiedName~ExportRendering|FullyQualifiedName~Application_ShouldNotReferenceExportRenderingLibraries"` 通过，`2/2 passed`。
- `dotnet build src/backend/MES.Api/MES.Api.csproj --no-restore` 通过，`0 warning / 0 error`。
