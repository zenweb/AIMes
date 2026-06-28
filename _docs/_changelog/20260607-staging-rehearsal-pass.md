# 2026-06-07 PostgreSQL/Staging Rehearsal PASS

## 变更

- 修复 Docker Compose Qdrant healthcheck：`qdrant/qdrant:latest` 不再内置 `curl`，改为容器内 bash TCP HTTP 200 探测 `/healthz`。
- 修复 `scripts/run-staging-rehearsal.ps1` 对 Docker Compose stderr 进度输出的误判：保留输出到报告，但按真实 process exit code 判定。
- 修复干净 PostgreSQL 首次迁移链：
  - 初始 equipment seed 的空 hstore 字面量。
  - PostgreSQL `xmin` 系统列迁移误创建/误重命名。
  - `system_users` 历史迁移数据操作在当前模型下无法推断列类型。
  - text 到 jsonb 迁移缺少 `USING column::jsonb`。
- 修复 API staging 启动/ready：
  - MassTransit 从 v9 退回 v8.5.7，避免无 `MT_LICENSE` 的开源/staging 启动阻断。
  - RabbitMQ healthcheck 升级到 v9.0.0 并适配 `RabbitMQ.Client` 7.x API。
  - RabbitMQ healthcheck 将 `rabbitmq://` 转换为 RabbitMQ.Client 可接受的 `amqp://`。

## 验证

- `dotnet build src/backend/MES.Api/MES.Api.csproj --no-restore`：PASS，0 warnings，0 errors。
- `docker compose build api`：PASS。
- `scripts/run-staging-rehearsal.ps1`：PASS。
- 报告：`_docs/_reports/staging-rehearsal-20260607-current.md`
- release gate audit：`_docs/_reports/release-gate-audit-20260607-after-staging-pass.md`

## 结论

- PostgreSQL/staging gate：PASS。
- v1.0.0 总 release gate：仍 FAIL，剩余 Attack Chain A/B/C 人工验证、安全签字、灰度观察。
