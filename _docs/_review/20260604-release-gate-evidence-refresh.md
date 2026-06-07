# 2026-06-04 Release Gate Evidence Refresh Review

## B-track Evidence Refresh

- 审计结论：Docker 环境已从“不可用”推进到“可用但 Docker Hub 拉取失败”；`gh` 已登录，但 hosted CI 仍未通过，因为当前 Git remote 不是可查询的 GitHub 仓库。
- 证据：`docker version` / `docker compose version` 成功；staging 报告失败于 `Start external dependencies`，错误为 Docker Hub `HTTP CONNECT: unexpected EOF`。
- Hosted CI：`_docs/_reports/hosted-ci-20260604.md` 明确缺 `RunUrl`、`RunId`、job summary，且 `gh run list` exit code 为 `1`，原因是当前仓库没有 GitHub remote。
- 总审计：`_docs/_reports/release-gate-audit-20260604.md` 为 `Result: FAIL`，Hosted CI、PostgreSQL/staging、Attack Chain A/B/C、Security signoff、Gray observation 全部 FAIL。
- 验证边界：本轮没有关闭任何 B-track gate；只把 2026-06-04 的真实环境状态重新落盘。

## Hosted CI Auth Follow-up

- 审计结论：`gh` 登录问题已解决，但 Hosted CI release gate 仍未关闭。
- 证据：`gh auth status` 成功，账号 `zenweb`；`gh run list --limit 5` 失败于当前仓库没有 GitHub host remote。
- Remote 证据：`origin` 仍指向 `https://git.code.tencent.com/zenweb/AIMes.git`，`git ls-remote origin` 返回 `Git:Project not found.`。
- 仓库线索：`gh repo list zenweb --limit 100` 仅列出 `zenweb/sg-e55d8fd2`、`zenweb/MaoYan`、`zenweb/szgjj`；未发现可对应 `AIMes` 的 GitHub 仓库。
- 验证边界：当前仍缺真实 GitHub Actions `RunUrl`、数字 `RunId` 和 job summary；不能用本地 workflow 文件或 `gh` 登录状态替代 hosted runner run。

## Hosted CI Auth Recheck

- 审计结论：2026-06-04 23:05 CST 复核后，阻断点仍是 GitHub repo/remote，不是 `gh` 登录。
- 证据：`gh auth status -h github.com` 成功，账号 `zenweb`，scope 含 `repo` / `workflow`。
- Remote 证据：`git remote -v` 仍为腾讯工蜂 `https://git.code.tencent.com/zenweb/AIMes.git`。
- 仓库证据：`gh repo view zenweb/AIMes --json nameWithOwner,url,visibility` 返回仓库不可解析。
- 验证边界：不继续撞 `gh run list` 或 Actions，直到有真实 GitHub remote/repo。

## Staging Rehearsal Recheck

- 审计结论：Docker 服务可用，但 staging gate 仍未关闭；阻断点是 Docker Desktop 代理/镜像源，外部依赖容器未启动。
- 证据：`_docs/_reports/staging-rehearsal-20260604-local.md` 23:33 CST 刷新，`Docker version` exit code 为 `0`。
- 失败点：`Start external dependencies` exit code 为 `1`，错误说明 Docker Desktop 没有 HTTPS proxy，直连 `registry-1.docker.io:443` 超时。
- 总闸门：`_docs/_reports/release-gate-audit-20260604.md` 已刷新，Hosted CI、PostgreSQL/staging、Attack Chain、Security signoff、Gray observation 仍全部 FAIL。
- 验证边界：没有继续重复拉取镜像；需要配置 Docker Desktop proxy/镜像源或预拉镜像后再复跑。
