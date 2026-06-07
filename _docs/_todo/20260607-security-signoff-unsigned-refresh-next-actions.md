# Todo：Security signoff unsigned refresh next actions

## 签字前置条件

- Attack Chain A/B/C 人工验证必须 PASS。
- 必须填写真实 verifier 和 VerifiedAt。
- 必须附上 Attack Chain A/B/C 三条真实 evidence。
- Security signer 必须填写 signer、SignedAt、Decision: SIGNED 和 signoff evidence。

## 当前禁止动作

- 不得用自动化安全自评替代人工签字。
- 不得用 Attack Chain automated support evidence 替代人工 Attack Chain A/B/C。
- 不得在 Attack Chain manual verification 仍 FAIL 时把 signoff 改为 SIGNED。

## 后续命令

人工验证完成后，先运行 Attack Chain manual verification，再更新 security signoff，最后重跑 release gate audit。
