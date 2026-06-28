# 2026-06-20 后端 Unit Tests 全量基线

## 变更
- 未改业务代码。
- 补充 Sprint 0.0 后端 Unit 层全量基线证据。

## 验证
- 命令：
  - `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore /p:SkipFrontendBuildCopy=true`
- 结果：
  - 444 passed / 0 failed / 0 skipped。

## 影响
- 后端 Unit Tests 当前可作为 Unit 层绿色基线。
- 这不代表 Integration、Frontend、Docker/PostgreSQL live readback 或 hosted CI 已完成。
