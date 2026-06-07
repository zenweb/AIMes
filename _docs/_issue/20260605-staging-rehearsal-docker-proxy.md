# 2026-06-05 Staging Rehearsal Docker Proxy Issue

## Issue

- Docker CLI 已安装，Docker Desktop engine 可启动。
- PostgreSQL/staging rehearsal 仍失败于外部依赖镜像拉取。
- 直接执行 `docker pull rabbitmq:4-management-alpine` 时，Docker Desktop 直连 `registry-1.docker.io:443` 超时，并提示没有 HTTPS proxy。

## Impact

- `postgresql`、`redis`、`rabbitmq`、`qdrant` 未能全部启动。
- EF migration 没有进入真实 PostgreSQL rehearsal。
- API 容器未启动，`/live`、`/ready` 没有 PASS 证据。
- PostgreSQL/staging gate 不能关闭。

## Required User/Environment Action

- 在 Docker Desktop 中配置可用 HTTPS proxy 或 registry mirror。
- 或手动预拉取以下镜像：
  - `postgres:16-alpine`
  - `redis:7-alpine`
  - `rabbitmq:4-management-alpine`
  - `qdrant/qdrant:latest`
- 完成后复跑：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\run-staging-rehearsal.ps1 -ReportPath _docs/_reports/staging-rehearsal-20260605-local.md -ReadyTimeoutSeconds 180
```
