# Todo: 后端 Unit Tests 全量基线后续

## 已完成
- [x] 完整后端 Unit Tests 运行。
- [x] 结果为 444 passed / 0 failed / 0 skipped。
- [x] 记录为 Sprint 0.0 Unit 层基线证据。

## 后续建议
- [ ] 串行运行后端 Integration 全量：`dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --no-restore /p:SkipFrontendBuildCopy=true`。
- [ ] 前端全量单元/覆盖率/e2e 分层采集。
- [ ] Docker/PostgreSQL live readback 恢复后补证据。
