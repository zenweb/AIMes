# 2026-06-05 OperationService Scan WorkOrder Lookup Changelog

## 变更

- 将 `OperationService.ScanAsync()` 中的工单查找从 `_workOrderRepository.GetAllAsync()` 的内存筛选，改为 `GetByCodeAsync(request.Code, innerCt)`。
- 保持原有行为不变：
  - 仍先检查是否存在同 code 的工序执行
  - 仍在 UoW 中创建执行记录
  - 仍绑定操作员和工位
  - 仍在找不到工单时抛出原错误
- 新增/更新验证：
  - `OperationServiceTests.ScanAsync_WhenCodeMatchesWorkOrder_ShouldCreateExecutionAndBindOperatorStation`

## 验证

- `dotnet test .\src\tests\MES.Tests.Unit\MES.Tests.Unit.csproj --filter FullyQualifiedName~OperationServiceTests.ScanAsync_WhenCodeMatchesWorkOrder_ShouldCreateExecutionAndBindOperatorStation --no-restore`
- `dotnet test .\src\backend\AIMes.slnx --no-build --no-restore`

## 结论

- 现场扫码入口的工单查找已收口为仓储直查，不再依赖全量加载。

