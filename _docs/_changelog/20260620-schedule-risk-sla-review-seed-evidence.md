# 2026-06-20 Schedule 风险 SLA review seed 证据

## 变更
- 集成测试 seed 增加 `RiskSlaReview` evidence link，覆盖当前排产计划的延期、供应与设备窗口风险。
- `db/ensure-current-schedule-plan.sql` 增加幂等 `RiskSlaReview` evidence link 插入，已有 Risk SLA 证据时不重复插入。
- 新增集成测试锁定 `/api/v1/scheduling/risk-sla-review/latest` 返回可审计晨会复核包。

## 验证
- `dotnet test src\tests\MES.Tests.Integration\MES.Tests.Integration.csproj --filter "FullyQualifiedName~SchedulingControllerTests|FullyQualifiedName~ScheduleRepositoryTests"`：70 个测试通过。
- 当前 Docker PostgreSQL 执行恢复脚本后，`/api/v1/scheduling/risk-sla-review/latest` 返回 200，含 `TRACE-RISK-SLA-DEMO-CURRENT` 与风险/动作明细。

