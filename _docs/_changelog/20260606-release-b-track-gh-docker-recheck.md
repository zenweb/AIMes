# 2026-06-06 B 轨 Hosted CI / Docker staging 复查

## 变更

- 复查 `gh`、Git remote、Docker 和 staging rehearsal 当前状态。
- 生成 Hosted CI 证据报告：`_docs/_reports/hosted-ci-github-actions-evidence-20260606-gh-recheck.md`。
- 生成 PostgreSQL/staging 演练报告：`_docs/_reports/staging-rehearsal-20260606-docker-gh-recheck.md`。
- 生成 release gate 汇总：`_docs/_reports/release-gate-audit-20260606-gh-docker-recheck.md`。

## 结论

- `gh auth status` 已登录为 `zenweb`，但当前 `origin` 是 `https://git.code.tencent.com/zenweb/AIMes.git`，不是 GitHub remote，`gh run list` 无法定位 GitHub Actions 仓库。
- Docker CLI / Compose 可用，但 Docker daemon 拉取 `postgres:16-alpine` 失败，错误显示 Docker Desktop 没有可用 HTTPS proxy。
- v1.0.0 B 轨发布闸门仍为 `Result: FAIL`。
