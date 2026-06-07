# 2026-06-07 Hosted CI GitHub Actions Recheck Next Actions

## 下一步

- 创建或提供 AIMes 对应 GitHub 仓库。
- 添加 GitHub remote，或把当前代码推到可见 GitHub 仓库。
- 触发 GitHub Actions run。
- 用真实 `RunUrl`、`RunId` 和 job summary 复跑：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/run-hosted-ci-evidence.ps1 -ReportPath _docs/_reports/hosted-ci-github-actions-evidence-20260607-pass.md -RemoteName <github-remote> -RunUrl <run-url> -RunId <run-id> -CommitSha <commit-sha> -Evidence <job-summary>
```

## 停止条件

- 没有 GitHub remote 或真实 Actions run 时，不继续反复运行 `gh run list` 烧 token。
- 没有 `RunUrl`、`RunId` 和 job summary 时，不声明 hosted CI gate 已关闭。
