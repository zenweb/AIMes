# 2026-05-31 Sprint 4 B3 OnTimeRate Review

## 结论

- B3 的本地验收已落地：OnTimeRate 口径已文档化，并由单元测试与 dashboard 集成测试覆盖。
- 新口径避免“只统计已完成工单”导致超期未完成工单不拉低准时率的问题。

## 风险

- 取消工单是否应排除分母尚未在计划中定义；当前实现按“已到期状态”进入分母。若业务需要排除取消单，应单独补规则与测试。
- `referenceTime` 在 API 中使用 `DateTime.UtcNow`；如后续要支持班次/时区口径，需要抽象时钟。

## 已验证

- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore --filter "FullyQualifiedName~ProductionKpiCalculatorTests"`
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --no-restore --filter "FullyQualifiedName~ReportControllerTests.GetDashboard_OnTimeRate_ShouldCountOverdueUnfinishedWorkOrdersInDenominator"`
