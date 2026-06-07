# 2026-05-31 Sprint 2 H1 AppService CancellationToken 传播

## 变更

- H1：`SchedulingAppService` 补齐仓储 I/O 的 `CancellationToken` 传播：
  - 排产优化读取设备、保存计划。
  - 计划查询、工单创建/查询/状态更新/删除。
  - 批量优化、采纳反馈保存、排产私有 helper 中的工单/物料/BOM 查询。
- H1：`QualityAppService` 补齐质检创建、查询、统计、根因分析、SPC 最近记录查询的 CT 传播。
- H1：`EquipmentAppService` 补齐设备创建、查询、统计、状态更新、健康报告、诊断、维护历史、瓶颈查询的 CT 传播。
- 新增架构测试 `H1TargetAppServices_ShouldPropagateCancellationTokenToRepositoryCalls`，防止计划点名的三个 AppService 回退到裸仓储调用。

## 红灯证据

- 新增架构测试初次红灯：
  - `H1TargetAppServices_ShouldPropagateCancellationTokenToRepositoryCalls`
  - 失败现象：首先命中 `SchedulingAppService.cs: _equipmentRepo.GetByWorkshopAsync(request.WorkshopId)` 未传 CT。
  - 结论：计划点名的 H1 AppService 层确实存在 CT 传播断点。

## 验证

- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter "FullyQualifiedName~H1TargetAppServices_ShouldPropagateCancellationTokenToRepositoryCalls" --no-restore`
  - 红灯确认后修复通过：1/1
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --filter "FullyQualifiedName~SchedulingAppServiceTests|FullyQualifiedName~QualityAppServiceTests|FullyQualifiedName~EquipmentAppServiceTests" --no-restore`
  - 通过：24/24
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore`
  - 通过：11/11
- `git diff --check -- <本次触达文件>`
  - 通过；仅有 Git 的 LF/CRLF 工作区提示。

## 备注

- 本轮按计划 2.8 点名范围聚焦 `SchedulingAppService` / `QualityAppService` / `EquipmentAppService`。
- 后续若继续扩展到所有 AppService，可把当前架构门从枚举重点调用升级为更通用的源码扫描规则。
