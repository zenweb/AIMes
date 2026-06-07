# 2026-06-05 Release Gate GitHub Recheck Issues

## Open

- 问题：Hosted CI 仍无法取证。
- 现象：`gh` 已登录 `zenweb`，但当前仓库没有 GitHub remote；`gh run list` 无法确定 base repo。
- 现象：`gh repo list zenweb --limit 100` 未发现 `zenweb/AIMes`。
- 现象：`_docs/_reports/hosted-ci-20260605.md` 为 `Result: FAIL`，缺 `RunUrl`、`RunId`、job summary。
- 影响：v1.0.0 release gate 不能证明 hosted runner 真实执行过 CI/eval。
- 需要处理：确认或创建 GitHub 仓库 remote，触发 Actions run，并回填真实 `RunUrl`、数字 `RunId` 和 job summary。

## Not A Code Fix

- 该问题不是继续写前端测试可以解决的缺口。
- 该问题不是 `gh auth login` 缺失；登录已经完成。
- 该问题也不是本地 `.github/workflows/*.yml` 是否存在；本地 workflow 文件存在但不能替代 hosted run。
