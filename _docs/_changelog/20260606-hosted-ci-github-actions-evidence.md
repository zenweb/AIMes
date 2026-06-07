# 2026-06-06 Hosted CI GitHub Actions 证据复核

- 复核 `gh auth status`：GitHub 登录可用，账号 `zenweb`，具备 `repo` / `workflow` scope。
- 复核当前 git remote：`origin` 指向 `https://git.code.tencent.com/zenweb/AIMes.git`，不是 GitHub remote。
- 只读查询 `gh repo list zenweb`，未发现 `zenweb/AIMes` GitHub 仓库。
- 运行 `scripts/run-hosted-ci-evidence.ps1` 生成 `_docs/_reports/hosted-ci-github-actions-evidence-20260606.md`。
- Hosted CI release gate 仍为 FAIL：缺 GitHub Actions `RunUrl`、`RunId`、job summary，且 `gh run list` 无法在当前 repo 解析 base repo。
