# Review: 后端 Unit Tests 全量基线

## 结论
- 通过。完整后端 Unit Tests 在当前工作树下通过，且使用 `/p:SkipFrontendBuildCopy=true` 避开前端静态文件拷贝干扰。

## 证据
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore /p:SkipFrontendBuildCopy=true`
- 444 passed / 0 failed / 0 skipped。

## 限制
- 仅证明后端 Unit 层通过。
- 未覆盖后端 Integration 全量、前端单元/e2e、Docker/PostgreSQL live readback、hosted CI 当前 HEAD。
