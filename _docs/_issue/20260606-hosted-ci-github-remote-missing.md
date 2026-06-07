# Issue: Hosted CI 缺 GitHub remote 与 Actions run

## 现象

`gh` 已登录 GitHub，但当前仓库没有指向 GitHub 的 remote，`gh run list` 无法解析 base repo。

## 证据

- `gh auth status`：账号 `zenweb` 已登录，token scope 包含 `repo`、`workflow`。
- `git remote -v`：`origin` 为 `https://git.code.tencent.com/zenweb/AIMes.git`。
- `gh repo list zenweb --limit 100`：未看到 `zenweb/AIMes`。
- `scripts/run-hosted-ci-evidence.ps1` 生成 `_docs/_reports/hosted-ci-github-actions-evidence-20260606.md`，结果 `FAIL`。

## 影响

Hosted CI 发布闸门不能关闭。当前缺少 GitHub Actions hosted runner 的 `RunUrl`、`RunId` 和 job summary。

## 下一步

- 创建或提供 AIMes 对应 GitHub 仓库。
- 添加 GitHub remote，或把当前代码推到可见 GitHub 仓库。
- 触发 GitHub Actions run。
- 用真实 `RunUrl`、`RunId` 和 job summary 复跑 `scripts/run-hosted-ci-evidence.ps1`。

## 状态

Open。不是本地软件安装问题；需要 GitHub 仓库/remote/run 这个外部状态。
