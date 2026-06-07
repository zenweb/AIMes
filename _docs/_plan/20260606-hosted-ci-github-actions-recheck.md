# 2026-06-06 Hosted CI GitHub Actions Recheck Plan

## Success Criteria

- `gh run list` 能绑定 AIMes GitHub 仓库。
- 取得真实 GitHub Actions `RunUrl`、`RunId`、job summary。
- `scripts/run-hosted-ci-evidence.ps1` 结果为 PASS。

## Current Stop Condition

- 当前缺 GitHub remote/run，不能关闭 hosted CI gate。
