# 2026-05-31 阶段一验收审计 Changelog

## 变更

- 新增 Sprint 3 决策门本地性能测试：100 工单规则引擎排产必须小于 3 秒。
- 更新 `_docs/SOP.md`：
  - Production 迁移改为显式 `dotnet ef database update`，启动只做 pending migration 校验。
  - 健康检查改为 `/live`、`/startup`、`/ready`、`/health`。
  - 补充 Console/File/OTLP 日志与 EF/Npgsql trace 的灰度验证口径。
  - 补充 Dockerfile 非 root/digest pin 运行口径与故障排查。
- 对齐 `docker-compose.yml`：
  - PostgreSQL 注释改为 Production 显式迁移口径。
  - Qdrant healthcheck 改为 `/healthz`，与 API readiness probe 一致。
- 新增阶段一审计、缺口、下一步文档。

## 验证

- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore --filter "FullyQualifiedName~SchedulingRuleEngineTests.GenerateInitialSchedule_OneHundredWorkOrders_CompletesUnderGrayReleaseGate"`：通过，1/1。

## 未验证

- GitHub Actions hosted runner、Docker build、staging readiness、OTLP/Seq/Tempo、首次灰度、2 周观察、安全人工签字。
