# 2026-05-31 Sprint 3 灰度前最小可观测性

## 变更

- Serilog 改为配置驱动，并接入：
  - Console sink
  - File sink：`logs/aimes-.log`
  - OpenTelemetry sink：默认 OTLP endpoint `http://localhost:4317`
- OpenTelemetry tracing 增加：
  - `AddEntityFrameworkCoreInstrumentation()`
  - `AddNpgsql()`
- 健康检查拆分为：
  - `/live`：只检查进程存活，不检查外部依赖。
  - `/startup`：启动门检查。
  - `/ready`：检查 PostgreSQL、Redis、RabbitMQ、Qdrant 等生产依赖。
  - `/health`：兼容旧入口，返回所有 health checks。
- 增加 `QdrantHealthCheck`：仅在 `AI:VectorStore:Provider=Qdrant` 时探测 Qdrant `/healthz`。
- 新增架构门 `Sprint3GrayReleaseObservability_ShouldExposeMinimumProductionTelemetryAndHealthGates`，防止灰度前最小可观测性接线回退。

## 验证

- 架构门先红：缺 Serilog 文件/OTLP sink、EF/Npgsql tracing、分级健康检查。
- 修复后定向架构门通过。
- `dotnet restore src/backend/MES.Api/MES.Api.csproj` 通过。
- `dotnet build src/backend/MES.Api/MES.Api.csproj --no-restore` 通过。

## 注意

- 本项只做 Sprint 3 灰度前硬前置的最小接线，不包含仪表盘、告警、`/diagnostics` 或 eval 平台化。
- 并行运行多个 dotnet 构建同一 `MES.Api` 时仍可能遇到 StaticWebAssets 文件锁；最终验证需串行执行。
