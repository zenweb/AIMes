# 2026-06-20 Schedule 采纳反馈 seed 证据

## 变更
- 集成测试 seed 为当前排产计划补默认可审计采纳反馈，包含 reason detail、traceId、agentDecisionId。
- `db/ensure-current-schedule-plan.sql` 在补齐 current plan 后，幂等补齐 `/scheduling/adoption-feedback/latest` 所需的采纳反馈样例。
- 新增集成测试覆盖 latest adoption feedback 必须返回可审计记录，不再依赖 404 空状态。

## 验证
- `dotnet test src\tests\MES.Tests.Integration\MES.Tests.Integration.csproj --filter "FullyQualifiedName~SchedulingControllerTests|FullyQualifiedName~ScheduleRepositoryTests"`：69 个测试通过。
- 当前 Docker PostgreSQL 执行 `db/ensure-current-schedule-plan.sql` 后，`/api/v1/scheduling/adoption-feedback/latest` 返回 200，含 `已采纳 Agent 排产建议`。

