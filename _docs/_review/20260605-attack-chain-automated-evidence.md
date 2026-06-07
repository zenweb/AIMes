# 2026-06-05 Attack Chain Automated Evidence Review

## Findings

- 审计结论：自动支撑证据已补齐，但 Attack Chain A/B/C manual gate 仍未关闭。
- 证据：`_docs/_reports/attack-chain-automated-evidence-20260605.md` 为 `Result: PASS`。
- 证据：Attack Chain A 自动支撑包括匿名 API 拒绝、公开登录/健康检查边界和 Agent 角色矩阵。
- 证据：Attack Chain B 自动支撑包括管理员创建用户审计脱敏、refresh token 仅哈希持久化、错误密码返回 unauthorized。
- 证据：Attack Chain C 自动支撑包括 JWT/CORS validated options、NuGet audit warning 不被压制、security self-assessment 漏洞输出 fail loud。
- 证据：`_docs/_reports/attack-chain-verification-20260605.md` 仍为 `PENDING_MANUAL_VERIFICATION` / `Result: FAIL`。

## Residual Risk

- 自动测试输出不是人工攻击链样本；仍需 verifier 运行或审查真实请求、日志、配置和环境证据。
- Attack Chain C 仍依赖 Hosted CI 与 PostgreSQL/staging PASS；这两项当前仍红。
- 总 release gate audit 仍为 `Result: FAIL`，不能发布。
