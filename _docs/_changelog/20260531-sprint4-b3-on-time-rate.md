# 2026-05-31 Sprint 4 B3 OnTimeRate Changelog

## 变更

- 新增 `ProductionKpiCalculator.CalculateOnTimeRate`，统一生产报表准时率口径。
- `ReportEndpoints` 的 `production.onTimeRate` 改用新口径：
  - 已完成工单进入分母。
  - 超期未完成工单进入分母并算未准时。
  - 未到期未完成工单不进入分母。
- 新增口径文档 `_docs/_design/20260531-on-time-rate-policy.md`。
- 修复集成测试启动时缺少 `Serilog.Sinks.OpenTelemetry` runtime 依赖的问题：测试项目显式引用该 sink。

## 验证

- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore --filter "FullyQualifiedName~ProductionKpiCalculatorTests"`：通过，1/1。
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --no-restore --filter "FullyQualifiedName~ReportControllerTests.GetDashboard_OnTimeRate_ShouldCountOverdueUnfinishedWorkOrdersInDenominator"`：通过，1/1。
