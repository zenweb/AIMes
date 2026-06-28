# 2026-06-20 ArchitectureTests 全量基线

## 变更
- 未改业务代码。
- 补充 Sprint 0.0 后端架构测试层级全量基线证据。

## 验证
- 命令：
  - `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore /p:SkipFrontendBuildCopy=true`
- 结果：
  - 118 passed / 0 failed / 0 skipped。

## 影响
- ArchitectureTests 当前可作为后端架构约束层的绿色基线。
- 这不代表 Unit、Integration、Frontend 或 Docker/PostgreSQL live readback 已完成。
