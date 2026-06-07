# 2026-05-31 阶段一下一步

## 必须在首次灰度前完成

- 在 GitHub Actions hosted runner 实跑根 CI，确认 `dotnet format`、ArchitectureTests、Unit/Integration、frontend lint/build、Docker build、NuGet/npm audit 全部通过。
- 在 staging 执行显式 EF migration，然后启动 API，确认 Production pending migration 会拒启动。
- 在 staging 验证 `/live`、`/startup`、`/ready`：
  - `/live` 不依赖外部服务。
  - `/ready` 覆盖 PostgreSQL、Redis、RabbitMQ、Qdrant。
  - Qdrant 健康 endpoint 如非 `/healthz`，需按部署版本修正。
- 配置 Seq/OTLP/Tempo，确认 Serilog 日志和 EF/Npgsql trace 可查询。
- 执行安全自评与攻击链 A/B/C 人工验证，产出签字记录。

## v1.0.0 发布前

- 首次小流量灰度。
- 连续 2 周墙钟观察无 P0/P1。
- 复核 README/ADR/CHANGELOG/SOP 是否与当前部署口径一致。
