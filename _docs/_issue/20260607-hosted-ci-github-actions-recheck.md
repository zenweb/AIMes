# 2026-06-07 Issue - Hosted CI 缺真实 GitHub Actions run 证据

## 问题

Hosted CI release gate 仍缺真实 GitHub Actions hosted runner 证据。当前 `gh` 已登录，但仓库 remote 不指向 GitHub，`gh run list` 无法定位 base repo。

## 证据

- `origin`：`https://git.code.tencent.com/zenweb/AIMes.git`。
- `gh repo view --json nameWithOwner,url,defaultBranchRef`：失败，当前仓库没有 GitHub remote。
- `gh run list --limit 10`：失败，无法确定 base repo。
- `_docs/_reports/hosted-ci-github-actions-evidence-20260607.md`：`Status: MISSING_REMOTE_RUN` / `Result: FAIL`。

## 影响

v1.0.0 B 轨 hosted CI 闸门不能关闭。没有真实 hosted runner run URL、run id 和 job summary 时，不能把本地 workflow 配置或本地测试结果当作发布级 CI 证据。

## 状态

Open。需要 GitHub 仓库/remote 和真实 Actions run 证据。
