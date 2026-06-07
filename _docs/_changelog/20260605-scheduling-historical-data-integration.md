# 2026-06-05 Scheduling Historical Data Integration

## 已完成
- 在 `src/backend/MES.Application/Services/SchedulingAppService.cs` 中接通排产历史数据：`OptimizeScheduleAsync` 现在会在 `ConsiderHistoricalData = true` 时，调用 `ISchedulingContextProvider.GetContextAsync(...)` 并将 `WorkOrders`、`WipItems`、`CurrentExecutions`、`ChangeoverMatrix`、`CompletenessScore` 序列化后传给优化器。
- 为历史数据读取增加空上下文兜底：当上下文提供器返回空值时，直接回退为 `null`，避免默认排产路径因为测试桩未配置而抛空引用。
- 同步补强 `src/tests/MES.Tests.Unit/Application/SchedulingAppServiceTests.cs`，新增 `ConsiderHistoricalData = true` 的单测，确认历史数据会进入 `ScheduleOptimizationRequest.HistoricalData`。

## 验证
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --filter SchedulingAppServiceTests`：通过，10/10。
- `dotnet test src/backend/AIMes.slnx --no-restore`：通过，`MES.Tests.Unit` 431/431，`MES.Tests.Integration` 174/174，`MES.ArchitectureTests` 85/85，`MES.Tests.Evaluation` 2/2。
