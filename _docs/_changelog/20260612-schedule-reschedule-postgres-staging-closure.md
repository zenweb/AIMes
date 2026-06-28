# 2026-06-12 Changelog：排产拖拽保存 PostgreSQL/staging 闭环

## 变更

- `PATCH /api/v1/scheduling/plans/{planId}/items/{itemId}` 改用 `IScheduleRepository.GetByIdForUpdateAsync` 读取 tracked 排产聚合，避免 PostgreSQL `xmin` 并发 token 下把 no-tracking 读模型当写模型更新。
- `ScheduleRepository` 保留 `GetByIdAsync` 的 `AsNoTracking()` 读路径，新增 tracked 写路径 `GetByIdForUpdateAsync`。
- `LlmGatewayService` 改为延迟构造 Semantic Kernel，避免排产 GET 这类读接口仅因生产环境未配置 LLM API key 而失败。
- `ScheduleRepositoryTests` 增加显式开启的 PostgreSQL/xmin 回归测试：
  - tracked 写路径能持久化拖拽窗口；
  - no-tracking 聚合用于写入会暴露 `DbUpdateConcurrencyException` 风险。
- staging rehearsal reschedule probe 已覆盖真实 API login、PATCH、GET read model、PostgreSQL 落库窗口一致性。

## 验证

- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --filter "FullyQualifiedName~LlmGatewayServiceTests|FullyQualifiedName~LlmConcurrencyGateTests"`：3 passed。
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --filter "FullyQualifiedName~SchedulingControllerTests"`：62 passed。
- `$env:AIMES_RUN_POSTGRES_TESTS='true'; dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --filter "FullyQualifiedName~ScheduleRepositoryTests"`：3 passed。
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter "FullyQualifiedName~ArchitectureRuleTests"`：113 passed。
- `docker compose build api`：通过。
- `scripts/run-staging-rehearsal.ps1 -ImagePullMode Never -IncludeRescheduleProbe`：PASS。

## staging 证据

- `Health /live`：HTTP 200。
- `Health /ready`：HTTP 200。
- `PATCH window`：`2026-06-12T19:00:00.000Z|2026-06-12T23:00:00.000Z`。
- `PostgreSQL stored window`：`2026-06-12T19:00:00.000Z|2026-06-12T23:00:00.000Z`。
- `GET plan window`：`2026-06-12T19:00:00.000Z|2026-06-12T23:00:00.000Z`。

## 说明

- 旧 staging 500 根因已关闭；新镜像下 PATCH 已返回 200。
- 后续 GET 400 根因为 LLM 网关构造时过早验证云模型密钥，已通过延迟初始化修复。
