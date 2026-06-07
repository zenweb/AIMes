# 2026-06-07 Hosted CI GitHub Actions Recheck

## 变更

- 复核 `gh auth status -h github.com`：GitHub 登录可用，账号 `zenweb`，scope 包含 `repo` / `workflow`。
- 复核当前 remote：`origin` 仍为 `https://git.code.tencent.com/zenweb/AIMes.git`，不是 GitHub remote。
- 运行 `scripts/run-hosted-ci-evidence.ps1`，生成 `_docs/_reports/hosted-ci-github-actions-evidence-20260607.md`。

## 结果

- Hosted CI release gate 仍为 `Result: FAIL`。
- 失败原因：缺 GitHub Actions `RunUrl`、数字 `RunId`、job summary；`gh run list` 无法在当前 repo 解析 GitHub base repo。
- 本次复核不关闭 hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度或 14 天无 P0/P1 观察窗口。
