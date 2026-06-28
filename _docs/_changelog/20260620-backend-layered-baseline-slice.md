# 2026-06-20 后端分层基线切片

## 变更
- 未改业务代码。
- 补充 `SkipFrontendBuildCopy` 接入后的后端分层测试基线证据。

## 验证
- Docker 状态：
  - `docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"` 失败。
  - 错误：`failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine`。
- Architecture 切片：
  - `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore /p:SkipFrontendBuildCopy=true --filter "FullyQualifiedName~BackendTestEntrypoints_ShouldSkipFrontendStaticCopy|FullyQualifiedName~ApiProjectFrontendStaticCopy_ShouldBeSkippableForBackendTestBuilds"`
  - 结果：2 passed / 0 failed / 0 skipped。
- Unit 切片：
  - `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore /p:SkipFrontendBuildCopy=true --filter "FullyQualifiedName~ScheduleAgentServiceTests.UpsertLabor|FullyQualifiedName~AgentPermissionPolicyTests"`
  - 结果：39 passed / 0 failed / 0 skipped。
- Integration 切片：
  - `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --no-restore /p:SkipFrontendBuildCopy=true --filter "FullyQualifiedName~SchedulingControllerTests.ExecutionEvidenceApi"`
  - 结果：1 passed / 0 failed / 0 skipped。

## 影响
- 新的 `SkipFrontendBuildCopy` 测试入口可以支撑 Architecture / Unit / Integration 三类后端切片。
- 这不是全量后端回归，也不是 Docker/PostgreSQL live readback。
