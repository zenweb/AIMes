# Todo: ArchitectureTests 全量基线后续

## 已完成
- [x] 完整 ArchitectureTests 运行。
- [x] 结果为 118 passed / 0 failed / 0 skipped。
- [x] 记录为 Sprint 0.0 架构层基线证据。

## 后续建议
- [ ] 串行运行后端 Unit 全量：`dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore /p:SkipFrontendBuildCopy=true`。
- [ ] 串行运行后端 Integration 全量。
- [ ] 前端全量单元/覆盖率/e2e 分层采集。
- [ ] Docker/PostgreSQL live readback 恢复后补证据。
