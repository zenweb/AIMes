# 2026-06-07 Plan - Hosted CI GitHub Actions Recheck

## 成功标准

- `gh auth status` 显示 GitHub 登录可用。
- 当前 repo 能被 `gh` 解析为 GitHub base repo。
- `gh run list` 能列出真实 GitHub Actions runs。
- Hosted CI evidence report 必须包含真实 `RunUrl`、数字 `RunId` 和 job summary，且 `Result: PASS`。

## 执行

1. 读取 hosted CI evidence 脚本和既有 recheck 文档。
2. 复核本地 workflow 文件存在。
3. 复核 `gh auth status`。
4. 复核当前 remote 和 `gh repo view` / `gh run list`。
5. 运行 `scripts/run-hosted-ci-evidence.ps1` 生成 2026-06-07 报告。
6. 记录结果并保持 release gate fail-loud。

## 结果

- `gh auth status` 已通过。
- 当前 `origin` 不是 GitHub remote。
- `gh repo view` / `gh run list` 无法定位 GitHub base repo。
- `_docs/_reports/hosted-ci-github-actions-evidence-20260607.md` 为 `Result: FAIL`。

## 非目标

- 不修改 remote。
- 不伪造 `RunUrl` / `RunId` / job summary。
- 不关闭 hosted CI 或 v1.0.0 总发布闸门。
