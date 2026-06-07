# 2026-06-05 Release Gate GitHub Recheck Review

## Findings

- 审计结论：`gh` 登录已可用，但 Hosted CI release gate 仍未关闭。
- 证据：`gh auth status` 显示账号 `zenweb` 已登录，token scope 包含 `repo` / `workflow`。
- 证据：`gh repo list zenweb --limit 100` 未列出 `AIMes` 仓库；当前可见仓库仅有 `zenweb/sg-e55d8fd2`、`zenweb/MaoYan`、`zenweb/szgjj`。
- 证据：`origin` 仍指向腾讯工蜂 `https://git.code.tencent.com/zenweb/AIMes.git`。
- 证据：`_docs/_reports/hosted-ci-20260605.md` 为 `Result: FAIL`，并记录 `RunUrl`、`RunId`、job summary 均缺失。
- 证据：同一报告中 `gh run` exit code 为 `1`，失败原因为当前仓库没有指向 GitHub host 的 remote。
- 证据：同一报告中 `git ls-remote origin` exit code 为 `128`，返回 `Git:Project not found.`。

## Residual Risk

- 不能用本地 workflow 文件存在、`gh` 登录成功或本地测试通过替代 hosted runner run。
- 需要用户确认创建 GitHub repo 的可见性和名称，或提供已有 GitHub remote；Codex 不应擅自创建公开/私有仓库。
- B-track 其它 release gate 仍缺 staging rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察证据。
