# Todo：Release B-track prerequisite next actions

## Hosted CI

- 将仓库 remote 指向真实 GitHub 仓库，或添加可被 `gh` 识别的 GitHub remote。
- 确认该仓库有 `.github/workflows/ci.yml` 和 `.github/workflows/eval.yml` 的 Actions run。
- 之后再运行 hosted CI evidence 脚本，取得 `RunUrl`、`RunId` 和 job summary。

## PostgreSQL/staging

- 配置 Docker Desktop HTTPS proxy 或 registry mirror。
- 或预拉取以下镜像：
  - `postgres:16-alpine`
  - `redis:7-alpine`
  - `rabbitmq:4-management-alpine`
  - `qdrant/qdrant:latest`
- 前置条件满足后再重跑 staging rehearsal。

## 人工门禁

- 执行 Attack Chain A/B/C 人工验证。
- 人工安全签字。
- 首次灰度发布并完成 14 天 P0/P1=0 观察。
