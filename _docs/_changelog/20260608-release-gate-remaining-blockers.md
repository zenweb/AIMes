# 2026-06-08 Release Gate Remaining Blockers

## 变更

- 复核 `release gate audit`、`attack-chain-verification`、`security-signoff`、`gray-observation` 当前证据。
- 更正 `20260607-security-signoff.md` 中已过期的交叉核对描述：
  - Hosted CI 改为引用 `_docs/_reports/hosted-ci-20260607.md`
  - PostgreSQL/staging 改为引用 `_docs/_reports/staging-rehearsal-20260607-current.md`，状态 `PASS`

## 结论

- 当前可自动关闭的发布阻断已经关闭到这里为止：
  - Hosted CI: PASS
  - PostgreSQL/staging: PASS
- 剩余 3 个硬门禁不能靠继续自动化脚本变成 PASS：
  - Attack Chain A/B/C：脚本强制要求真实 `Verifier`、`VerifiedAt`、A/B/C 人工证据
  - Security signoff：必须由人类 signer 将 `Status/Decision` 改为 `SIGNED`
  - Gray observation：必须先发生首次灰度发布，再经过 14 calendar days 且 P0/P1 = 0

## 决策

- 不再重复尝试用自动化脚本“刷绿”这 3 个门禁。
- 后续推进以人工验证包、签字动作、灰度发布时间窗为主。
