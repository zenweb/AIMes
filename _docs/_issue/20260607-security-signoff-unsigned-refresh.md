# Issue：Security signoff 仍未签字

## 状态

2026-06-07 security signoff packet 已生成，但状态仍为 `UNSIGNED`。

## 风险

自动化安全自评和 Attack Chain 自动化支持证据均为 PASS，但人工 Attack Chain A/B/C 仍为 PENDING / FAIL。若此时签字，会绕过 v1.0.0 安全发布门禁。

## 证据

- `_docs/_review/20260607-security-signoff.md`
- `_docs/_reports/release-gate-audit-20260607-security-signoff-unsigned.md`

## 当前缺口

- Security signer 为空。
- SignedAt 为空。
- Decision 为 `UNSIGNED`。
- Evidence 为空。
- Attack Chain A/B/C manual verification 仍未 PASS。
