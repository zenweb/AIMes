# Issue：Hosted CI workflow 仍使用旧 v1 目录模型

## 状态

GitHub Actions run `27084449100` 失败在 workflow 工作目录解析：runner checkout 后仓库根目录已经是项目根，但旧 workflow 仍访问 `/v1`。

## 证据

- frontend job：`working directory '/home/runner/work/AIMes/AIMes/v1/src/frontend'. No such file or directory`
- backend job：`working directory '/home/runner/work/AIMes/AIMes/v1'. No such file or directory`
- Agent Evaluation：`working directory '/home/runner/work/AIMes/AIMes/./v1'. No such file or directory`

## 风险

如果只重跑旧 workflow，Hosted CI 会稳定失败在路径层，无法验证真实 backend/frontend/security 质量 gate。

## 当前处理

workflow 已改为仓库根目录模型；本地等价验证已通过，仍需 GitHub hosted runner 新 run 证明。
