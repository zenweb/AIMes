# 2026-06-06 B 轨发布闸门复检报告

日期：2026-06-06

## 范围

- B 轨道：v1.0.0 发布硬闸门复检。
- 本片利用用户已完成的 `gh auth login` 和 Docker 安装状态，重新验证 hosted CI 与 PostgreSQL/staging 能否推进。
- 本片未关闭发布闸门；目标是拿到当前真实阻断证据，避免 A 轨绿色掩盖 B 轨红灯。

## 结果摘要

- `gh auth status`：PASS，账号 `zenweb` 已登录 GitHub.com，具备 `repo`、`workflow` 等 scope。
- GitHub hosted CI：FAIL。当前 repo remote 为 `https://git.code.tencent.com/zenweb/AIMes.git`，不是 GitHub remote；`gh run list` 无法确定 base repo。
- Docker daemon：已从未启动推进到可用，`docker info` 返回 `ServerVersion=29.5.2 OSType=linux`。
- PostgreSQL/staging：FAIL。Docker Desktop daemon 可用，但 `postgres:16-alpine` 拉取超时；Docker Hub 访问仍需要可用 HTTPS proxy、registry mirror 或预拉镜像。
- Aggregate release gate：FAIL。

## 证据包

- Hosted CI recheck：`_docs/_reports/hosted-ci-20260606-gh-auth-recheck.md`。
- Docker engine unavailable first check：`_docs/_reports/staging-rehearsal-20260606-docker-engine-recheck.md`。
- Docker engine started check：`_docs/_reports/staging-rehearsal-20260606-docker-engine-started.md`。
- Docker proxy/pull recheck：`_docs/_reports/staging-rehearsal-20260606-docker-proxy-recheck.md`。
- Aggregate gate：`_docs/_reports/release-gate-audit-20260606-b-track-recheck.md`。

## 代码/脚本变更

- `scripts/run-staging-rehearsal.ps1`
  - 修复 `Test-DockerImageExists()`：避免 `docker image inspect` 在 `$ErrorActionPreference = Stop` 下提前中断 Missing 模式。
  - 现在 Missing 模式能继续进入 `docker pull`，报告真实镜像拉取/代理失败原因。

## 当前阻断

- Hosted CI：需要将当前工作树关联到 GitHub 仓库 remote，或提供实际 GitHub Actions `RunUrl`、`RunId` 和 job summary evidence。
- PostgreSQL/staging：需要 Docker Desktop 配置可用 HTTPS proxy / registry mirror，或预拉 `postgres:16-alpine`、`redis:7-alpine`、`rabbitmq:4-management-alpine`、`qdrant/qdrant:latest`。
- Attack Chain A/B/C：仍需人工 verifier、VerifiedAt 和 A/B/C 证据。
- Security signoff：仍需人类 signer 在 Attack Chain 手工验证后签字。
- Gray observation：首次灰度和 14 天 P0/P1=0 观察窗口仍未开始。

## 验证命令

- `gh auth status; gh repo view --json nameWithOwner,url; gh run list --limit 5`。
- `docker --version; docker compose version; docker info`。
- `powershell -ExecutionPolicy Bypass -File scripts\run-hosted-ci-evidence.ps1 -ReportPath _docs\_reports\hosted-ci-20260606-gh-auth-recheck.md`。
- `powershell -ExecutionPolicy Bypass -File scripts\run-staging-rehearsal.ps1 -ReportPath _docs\_reports\staging-rehearsal-20260606-docker-proxy-recheck.md -ImagePullMode Missing -ReadyTimeoutSeconds 60 -DockerPullTimeoutSeconds 60`。
- `powershell -ExecutionPolicy Bypass -File scripts\run-release-gate-audit.ps1 -ReportPath _docs\_reports\release-gate-audit-20260606-b-track-recheck.md ...`。

## 结论

B 轨 release gate 继续 FAIL，但不是因为缺少本地 `gh auth` 或 Docker CLI。当前外部状态阻断已经收敛为 GitHub remote/Actions 证据缺失，以及 Docker Hub 依赖镜像拉取通道不可用。
