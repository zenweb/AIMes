# Todo：Security Self-Assessment 下一步

## 下一步

- 由真实验证人执行 Attack Chain A/B/C，并使用 `scripts/run-attack-chain-verification.ps1` 生成带 `Verifier`、`VerifiedAt` 和三条真实证据的报告。
- 人工安全签字需引用本次安全自评 PASS、Attack Chain A/B/C 人工 PASS 和签字人/时间。
- PostgreSQL/staging 仍需 Docker 镜像拉取、预拉取或 registry/proxy 修复后再跑 staging rehearsal。
- Hosted CI 仍需 GitHub remote 与 Actions run 证据。

## 可执行命令模板

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/run-attack-chain-verification.ps1 `
  -ReportPath _docs/_reports/attack-chain-verification-20260607-manual.md `
  -Verifier "<真实验证人>" `
  -VerifiedAt "<ISO-8601 时间>" `
  -AttackChainA PASS `
  -AttackChainB PASS `
  -AttackChainC PASS `
  -AttackChainAEvidence "<真实 A 链证据>" `
  -AttackChainBEvidence "<真实 B 链证据>" `
  -AttackChainCEvidence "<真实 C 链证据>"
```

## 发布闸门

- 本地自动化安全自评已 PASS。
- 人工 Attack Chain、human security signoff、Hosted CI、PostgreSQL/staging、首次灰度、14 天 P0/P1=0 仍未关闭。
