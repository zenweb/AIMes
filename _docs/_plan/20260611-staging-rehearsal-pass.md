# 2026-06-11 Plan: PostgreSQL/Staging Rehearsal 收敛

## 目标

刷新 CC plan B-track 中 PostgreSQL/staging release gate 的当前证据，确认 Docker 修复后真实 staging rehearsal 能通过。

## 执行顺序

1. 确认 Docker Desktop/Linux Engine 可用。
2. 顺序运行后端测试项目，避免并行编译锁误报。
3. 运行 `scripts/run-staging-rehearsal.ps1`。
4. 核对 Docker compose 服务状态与 API `/live`、`/ready`。
5. 刷新 release gate audit。
6. Docker 修复确认后复跑 staging rehearsal，生成独立 docker-restored 证据。
7. 用 docker-restored staging 证据刷新 release gate audit。

## Stop Condition

- `_docs/_reports/staging-rehearsal-20260611-current.md` 显示 `Result: PASS`。
- `_docs/_reports/staging-rehearsal-20260611-docker-restored.md` 显示 `Result: PASS`。
- `docker compose ps` 显示 PostgreSQL、Redis、RabbitMQ、Qdrant、API 正常运行，其中依赖服务 healthy。
- `/live` 和 `/ready` 均返回 HTTP 200 `Healthy`。
- `_docs/_reports/release-gate-audit-20260611-after-docker-restored-staging-rerun.md` 显示 PostgreSQL/staging 为 PASS。
- Aggregate release gate 不标记完成；剩余人工闸门继续 fail loud。
