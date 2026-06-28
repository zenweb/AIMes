# Issue：剩余 Release Gate 阻断不是代码自动化问题

## 状态

- Hosted CI: RESOLVED
- PostgreSQL/staging: RESOLVED
- Attack Chain A/B/C: OPEN
- Security signoff: OPEN
- Gray observation: OPEN

## 问题定义

剩余 3 个 gate 的 FAIL 原因不是脚本错误、环境缺失或代码缺陷，而是发布流程中必须由人或时间窗口提供的证据尚未产生。

## 证据

- Attack Chain 脚本要求：`Verifier`、`VerifiedAt`、A/B/C `Evidence` 都必须是真值。
- Security signoff 文档要求：`Status/Decision` 必须由 human signer 改为 `SIGNED`。
- Gray observation 脚本要求：first gray release + 14 calendar days + `P0=0` and `P1=0`。

## 处理原则

- 对这 3 个 gate，继续自动化重试不会产出新价值。
- 后续应转为人工执行与时间窗口跟踪。
