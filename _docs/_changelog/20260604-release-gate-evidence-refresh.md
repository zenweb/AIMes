# 2026-06-04 Release Gate Evidence Refresh

## B-track Evidence Refresh After Docker/gh Setup Claim

- 目标：在用户确认 Docker 和 `gh` 可用后，恢复 v1.0.0 B-track release gate 审计，刷新 2026-06-04 证据包。
- Docker 结果：`docker version` 和 `docker compose version` 均通过；Docker Desktop 可用。
- Hosted CI 结果：`gh auth status` 已通过；`gh run list --limit 5` 仍失败，原因是当前仓库没有 GitHub remote；`git ls-remote origin` 仍返回 `Git:Project not found.`；`_docs/_reports/hosted-ci-20260604.md` 为 `Result: FAIL`。
- PostgreSQL/staging 结果：`_docs/_reports/staging-rehearsal-20260604-local.md` 为 `Result: FAIL`；失败点从“无 docker”推进为 Docker Hub 镜像解析失败：`reading HTTP CONNECT: unexpected EOF`。
- Attack Chain / Gray：刷新 `_docs/_reports/attack-chain-verification-20260604.md` 和 `_docs/_reports/gray-observation-20260604.md`，仍分别为人工验证未完成和灰度未开始。
- Security signoff：新增 `_docs/_review/20260604-security-signoff.md`，保持 `Status: UNSIGNED`。
- 总审计：新增 `_docs/_reports/release-gate-audit-20260604.md`，五个 evidence packet 均为 `FOUND`，五个 release gate 仍为 `FAIL`。

## Hosted CI Auth Refresh

- 复核时间：2026-06-04 21:30 CST。
- `gh auth status` 已通过，账号为 `zenweb`，token scope 包含 `repo` / `workflow`。
- `gh run list --limit 5` 仍失败，根因从“未登录”收敛为“当前仓库没有 GitHub remote”；`origin` 仍是 `https://git.code.tencent.com/zenweb/AIMes.git`。
- `gh repo list zenweb --limit 100` 未发现 `zenweb/AIMes` 或 `zenweb/aimes`；直接 `gh repo view zenweb/AIMes` / `zenweb/aimes` 均无法解析仓库。
- 已刷新 `_docs/_reports/hosted-ci-20260604.md` 和 `_docs/_reports/release-gate-audit-20260604.md`；Hosted CI gate 仍为 `Result: FAIL`，但不再归因为 `gh` 未登录。

## Hosted CI Auth Recheck

- 复核时间：2026-06-04 23:05 CST。
- `gh auth status -h github.com` 通过，账号 `zenweb`，token scope 包含 `repo` / `workflow`。
- `git remote -v` 仍显示 `origin=https://git.code.tencent.com/zenweb/AIMes.git`。
- `gh repo view zenweb/AIMes --json nameWithOwner,url,visibility` 返回 `Could not resolve to a Repository`；Hosted CI 仍缺真实 GitHub repo/remote。

## Staging Rehearsal Recheck

- 复核时间：2026-06-04 23:33 CST。
- `scripts/run-staging-rehearsal.ps1` 已重跑并刷新 `_docs/_reports/staging-rehearsal-20260604-local.md`。
- Docker 版本检查通过：Docker `29.5.2`，Docker Compose `v5.1.4`。
- 外部依赖启动仍失败：Docker Desktop 未配置 HTTPS proxy，直连 `registry-1.docker.io:443` 拉取 `redis:7-alpine` 超时，`postgres`、`rabbitmq`、`qdrant` 拉取被中断。
- 已重跑 `_docs/_reports/release-gate-audit-20260604.md`；总闸门仍为 `Result: FAIL`。
