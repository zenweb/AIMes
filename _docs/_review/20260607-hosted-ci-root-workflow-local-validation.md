# Review：Hosted CI root workflow local validation

## 结论

CI run `27084449100` 的第一层根因是 workflow 仍按旧目录模型查找 `/v1`，而 GitHub repo 当前根目录已经是 `v1` 内容。本轮修复让 workflow 在仓库根执行，并用本地 CI 等价命令验证主要 gate。

## 已验证

- 后端 restore/build/format/architecture/unit/integration 均通过。
- 后端覆盖率阈值脚本通过：line 14.61%，branch 30.72%。
- 前端 install/lint/unit/coverage/build 均通过。
- 官方 npm registry audit 通过，0 vulnerabilities。
- 本地 `npmmirror` audit 失败是 registry API 能力差异，不是漏洞证据。

## 残余风险

- Hosted CI gate 仍未 PASS，必须等待 GitHub Actions 新 run。
- Docker build 只会在 hosted CI 的 container job 中形成发布证据。
- 当前工作树包含大量既有大改；本地验证证明当前整体状态可跑，但提交/推送时必须避免带入生成物。
