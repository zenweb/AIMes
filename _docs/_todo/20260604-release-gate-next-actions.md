# 2026-06-04 Release Gate Next Actions

## 用户需要处理

- 已完成：`gh auth login`，`gh auth status` 当前已登录 `zenweb`。
- 确认或创建可访问的 GitHub 仓库 remote；2026-06-04 23:05 CST 复核当前 `origin` 仍是 `https://git.code.tencent.com/zenweb/AIMes.git`，不是 GitHub remote，且 `gh repo view zenweb/AIMes` 返回仓库不可解析。
- 触发 GitHub Actions run，并让 `gh run list --limit 5` 能在该 GitHub repo 下列出 run。
- 提供或回填 hosted CI 的真实 `RunUrl`、数字 `RunId` 和 job summary。
- 修复 Docker Desktop HTTPS proxy/镜像源问题，或预先拉取 `postgres:16-alpine`、`rabbitmq:4-management-alpine`、`redis:7-alpine`、`qdrant/qdrant:latest`；23:33 CST 复核失败点为直连 `registry-1.docker.io:443` 超时。
- 完成 Attack Chain A/B/C 人工验证、security signoff 和首次灰度后 14 天观察。

## Codex 可继续处理

- 环境修复后复跑 `_docs/_reports/hosted-ci-20260604.md`。
- Docker 镜像可拉取后复跑 `_docs/_reports/staging-rehearsal-20260604-local.md`。
- 任一单项证据更新后，复跑 `_docs/_reports/release-gate-audit-20260604.md`。
