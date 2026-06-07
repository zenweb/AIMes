# 2026-05-31 阶段一验收缺口

## 外部待验证

- GitHub Actions hosted runner 未实跑：根 `.github/workflows/ci.yml` 的 backend/frontend/container/security jobs 需要在远端执行确认。
- Docker build 未实跑：本机没有 Docker/crane/skopeo/regctl，只完成 Dockerfile 静态门。
- staging 依赖未验证：PostgreSQL、Redis、RabbitMQ、Qdrant、Seq/OTLP、Tempo 需要真实连通性验证。
- `/ready` 对 Qdrant 使用 `/healthz`，需确认目标部署版本 endpoint 与认证头。
- Serilog OpenTelemetry sink 与 OTel exporter 默认 endpoint 仍需生产/staging 覆盖并确认日志/trace 可见。

## 发布待办

- 安全自评尚未完成，攻击链 A/B/C 需要人工验证并签字。
- 首次灰度尚未开始，`2 周无 P0/P1` 观察期无法压缩。
- README/ADR 发布前完整性仍需复核；本轮只更新 SOP。

## 已补缺口

- 已新增本地性能门：100 工单规则引擎排产必须小于 3 秒。
- 已更新 SOP：显式生产迁移、`/live`/`/startup`/`/ready`、OTLP/File 日志、Qdrant/RabbitMQ readiness、非 root Docker 运行口径。
