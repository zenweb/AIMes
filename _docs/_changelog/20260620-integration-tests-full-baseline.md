# 2026-06-20 后端 Integration Tests 全量基线

## 变更
- 未改业务代码。
- 补充 Sprint 0.0 后端 Integration 层全量基线证据。

## 验证
- 命令：
  - `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --no-restore /p:SkipFrontendBuildCopy=true`
- 结果：
  - 203 passed / 0 failed / 0 skipped。
  - 持续时间约 1m 13s。

## 影响
- 后端 Integration Tests 当前可作为 Integration 层绿色基线。
- 当前后端本地三层基线：
  - ArchitectureTests：118 passed。
  - Unit Tests：444 passed。
  - Integration Tests：203 passed。
