# 2026-05-31 Sprint 5 Dead Integration Stubs

## 变更

- 删除未被应用服务或端点消费的集成占位接口：
  - `IErpService`
  - `IWmsService`
  - `IMaterialCallService`
  - `IMaterialDeliveryTracker`
  - `IEquipmentCommandService`
- 删除对应 Infrastructure `*Stub` 实现和 `IntegrationDtos.cs`。
- 移除 `AddApplicationServices` 中这些占位集成 Stub 的 DI 注册。
- 新增架构门禁 `Sprint5DeadIntegrationStubs_ShouldNotRemainRegisteredOrCompiled`，防止未接线 Stub 回流到运行时 DI。

## 验证

- 红灯：新增门禁曾因 `ErpServiceStub.cs` 等文件存在失败。
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore --filter "FullyQualifiedName~Sprint5DeadIntegrationStubs"` 通过，`1/1 passed`。
- `dotnet build src/backend/MES.Api/MES.Api.csproj --no-restore` 通过，`0 warning / 0 error`。
- `rg -n "MES\\.Domain\\.Interfaces\\.Integration|IErpService|IWmsService|IMaterialCallService|IMaterialDeliveryTracker|IEquipmentCommandService|ErpServiceStub|WmsServiceStub|MaterialCallServiceStub|MaterialDeliveryTrackerStub|EquipmentCommandServiceStub" src/backend src/tests -g "*.cs"` 仅剩架构门禁引用。

## 范围说明

- 本轮只删除当前运行时未消费的集成占位代码。
- `DemoDataSeeder`、`AuditEndpointFilter`、`ValidationEndpointFilter` 仍有明确运行时用途，未纳入本轮删除。
