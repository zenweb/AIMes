# 2026-05-31 Sprint 3 灰度前最小可观测性 Review

## 结论

- Sprint 3 决策门前移的 4.2 / 4.3 / 4.7 基线可观测性已接入：
  - 结构化日志进入 Console、文件和 OTLP。
  - EF Core / Npgsql trace 已纳入 OpenTelemetry。
  - `/live`、`/ready`、`/startup` 已分级。

## 风险

- `/ready` 的 Qdrant 检查依赖 Qdrant `/healthz`，若部署版本路径不同，需要按环境调整。
- OTLP endpoint 仍需部署时通过配置覆盖；默认值只适合本地或 Seq/collector 默认端口。
- 没有做仪表盘/告警，这是计划明确移出 v1 的范围。

## 已验证

- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore --filter Sprint3GrayReleaseObservability_ShouldExposeMinimumProductionTelemetryAndHealthGates`
- `dotnet restore src/backend/MES.Api/MES.Api.csproj`
- `dotnet build src/backend/MES.Api/MES.Api.csproj --no-restore`
