# Todo：Release B-track prerequisite next actions

## Hosted CI

- 已关闭。最新证据为 `_docs/_reports/hosted-ci-20260607.md`，remote main `3e494aea466fdff579e4e11ecb44600f5f8283c4` 已触发 CI run `27089905065` 和 Agent Evaluation run `27089905061`，两者均为 `success`。
- 后续只需在新的远端 main 提交后刷新 hosted CI evidence，不再把 Hosted CI 列为当前阻断项。

## PostgreSQL/staging

- 当前首要阻断是 Docker Desktop Linux engine 不可用：`docker info` 失败在 `npipe:////./pipe/dockerDesktopLinuxEngine`。
- 先启动/修复 Docker Desktop Linux engine，再重跑 staging rehearsal。
- 如果 engine 可用后才进入镜像拉取问题，再配置 Docker Desktop HTTPS proxy / registry mirror，或预拉取以下镜像：
  - `postgres:16-alpine`
  - `redis:7-alpine`
  - `rabbitmq:4-management-alpine`
  - `qdrant/qdrant:latest`
- 前置条件满足后重跑 `scripts/run-staging-rehearsal.ps1`。

## 人工门禁

- 执行 Attack Chain A/B/C 人工验证。
- 人工安全签字。
- 首次灰度发布并完成 14 天 P0/P1=0 观察。
