# Review: 后端 Integration Tests 全量基线

## 结论
- 通过。完整后端 Integration Tests 在当前工作树下通过，且使用 `/p:SkipFrontendBuildCopy=true` 避开前端静态文件拷贝干扰。

## 证据
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --no-restore /p:SkipFrontendBuildCopy=true`
- 203 passed / 0 failed / 0 skipped。

## 限制
- 仅证明后端 Integration 层通过。
- 未覆盖前端单元/e2e、Docker/PostgreSQL live readback、hosted CI 当前 HEAD。
- 集成测试使用项目测试宿主/测试数据库策略，不等价于 Docker compose staging。
