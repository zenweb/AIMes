# 2026-06-20 人员替班/资质阻断后端 Readback 证据补强

## 变更
- 未改业务代码。
- 补充人员替班/资质阻断后端端点和审计落库的当前验证证据。

## 证据
- Docker live readback：
  - `docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"` 失败。
  - 错误：`failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine`。
  - 因此本轮不能声称容器/PostgreSQL 真实 readback。
- 后端端点映射：
  - `src/backend/MES.Api/Endpoints/SchedulingEndpoints.cs` 映射：
    - `GET /api/v1/scheduling/labor-reassignments`
    - `POST /api/v1/scheduling/labor-reassignments`
    - `GET /api/v1/scheduling/labor-qualification-blocks`
    - `POST /api/v1/scheduling/labor-qualification-blocks`
- 后端服务：
  - `ScheduleAgentService.QueryLaborReassignmentsAsync` 查询 `EvidenceType = "LaborReassignment"`。
  - `ScheduleAgentService.QueryLaborQualificationBlocksAsync` 查询 `EvidenceType = "LaborQualificationBlock"`。
  - Upsert 路径写入 `AgentEvidenceLink` 和 `AuditLog`。
- 单元测试：
  - `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --filter "FullyQualifiedName~ScheduleAgentServiceTests.UpsertLabor" --no-restore`
  - 结果：2 passed / 0 failed / 0 skipped。
- 集成测试：
  - 初次带 build 运行被 API 项目的前端拷贝 target 卡住：`wwwroot/scheduling/_nuxt/builds/meta` 删除权限失败。
  - 改用已编译产物验证：`dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --filter "FullyQualifiedName~SchedulingControllerTests.ExecutionEvidenceApi" --no-build`
  - 结果：1 passed / 0 failed / 0 skipped。

## 影响
- 人员替班/资质阻断证据链现在有前端 fail-loud 单测、后端服务单测和后端 API 集成测试三层证据。
- Docker/PostgreSQL live readback 仍未闭合，需要 Docker Desktop Linux Engine 在当前 shell 可达后补跑。
