# Review: ArchitectureTests 全量基线

## 结论
- 通过。完整 ArchitectureTests 在当前工作树下通过，且使用 `/p:SkipFrontendBuildCopy=true` 避开前端静态文件拷贝干扰。

## 证据
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore /p:SkipFrontendBuildCopy=true`
- 118 passed / 0 failed / 0 skipped。

## 限制
- 仅证明架构测试层通过。
- 未覆盖后端 Unit/Integration 全量、前端单元/e2e、Docker/PostgreSQL live readback、hosted CI 当前 HEAD。
