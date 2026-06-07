# 2026-06-05 Staging Rehearsal Fail-Loud

## Change

- 复跑 PostgreSQL/staging rehearsal，确认 Docker CLI 与 Docker Desktop engine 已可用。
- `scripts/run-staging-rehearsal.ps1` 新增 `Pull external dependency images` 步骤，在 `docker compose up` 前显式拉取：
  - `postgres:16-alpine`
  - `redis:7-alpine`
  - `rabbitmq:4-management-alpine`
  - `qdrant/qdrant:latest`
- 为单镜像 `docker pull` 增加超时保护；Docker Hub/代理不可用时不再长时间挂起，而是写入 FAIL 报告。

## Validation

- PowerShell parser：`scripts/run-staging-rehearsal.ps1` parse ok。
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter "StagingRehearsal"`：`3 tests passed`。
- `scripts/run-staging-rehearsal.ps1 -ReportPath _docs/_reports/staging-rehearsal-20260605-local.md`：`Result: FAIL`，失败点为 `Pull external dependency images`。
- `scripts/run-release-gate-audit.ps1 ... -ReportPath _docs/_reports/release-gate-audit-20260605.md`：`Result: FAIL`。

## Release Boundary

- 本轮只提升 staging 失败证据质量，不关闭 PostgreSQL/staging gate。
- 当前仍缺真实依赖启动、EF migrations、API 启动、`/live`、`/ready` 的 PASS 证据。
