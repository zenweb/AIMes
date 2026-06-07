# 2026-05-31 Sprint 3 灰度前最小可观测性 Issue

## 已处理问题

- Sprint 3 决策门要求首次灰度前具备最小可观测性，但当前只暴露 `/health`，没有 `/live` / `/ready` / `/startup` 分级。
- Serilog 只写 Console，未写文件，也未接 OTLP Logs。
- OpenTelemetry 已有 HTTP/Runtime，但缺 EF Core / Npgsql trace。
- RabbitMQ / Qdrant 未纳入 readiness 检查。

## 剩余限制

- 真实 OTLP/Seq/Tempo/RabbitMQ/Qdrant 连通性需要 staging 环境验证。
- 当前本机未运行外部依赖，不能用本地 `/ready` 证明生产依赖健康。
