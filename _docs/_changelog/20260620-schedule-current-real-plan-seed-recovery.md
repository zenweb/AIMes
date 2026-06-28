# 2026-06-20 Schedule current 真实计划 seed 恢复

## 变更
- `ScheduleRepository.GetCurrentPlanAsync` 只返回覆盖当前时间且包含排产项的计划，避免空计划被误判为可用 current plan。
- `DemoDataSeeder.SeedScheduleAsync` 不再因数据库已有过期计划而跳过；只有已有“当前且有排产项”的计划时才跳过。
- 集成测试 seed 增加最小工单与当前排产计划，锁定 `/api/v1/scheduling/current` 在测试环境必须返回可用计划。
- 新增 `db/ensure-current-schedule-plan.sql`，用于本地/演示 PostgreSQL 幂等补齐当前工单与 current schedule plan。

## 验证
- 红灯：`GetCurrentPlan_ShouldReturnSeededCurrentPlan` 原先返回 404。
- 绿灯：`dotnet test src\tests\MES.Tests.Integration\MES.Tests.Integration.csproj --filter "FullyQualifiedName~SchedulingControllerTests|FullyQualifiedName~ScheduleRepositoryTests"`，68 个测试通过。
- 当前 Docker PostgreSQL 执行 `db/ensure-current-schedule-plan.sql` 后，`/api/v1/scheduling/current` 返回 `当前演示排产计划` 与 3 个排产项。

