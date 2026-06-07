# Todo：Hosted CI root workflow local validation next actions

## 下一步

- 提交当前已验证源码、workflow、脚本和文档，排除 build/test 生成物。
- 推送到 GitHub `main` 触发新的 CI 和 Agent Evaluation runs。
- 等待 hosted runner 完成后运行 `scripts/run-hosted-ci-evidence.ps1`。
- 若新 run PASS，再重跑 release gate audit；若 FAIL，读取 hosted 日志继续定位真实失败项。

## 禁止动作

- 不要把本地验证当作 Hosted CI PASS。
- 不要把 `TestResults/`、frontend coverage、Nuxt build 输出提交进仓库。
- 不要使用用户提供的密码或将其记录进任何文档。
