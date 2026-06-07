# Todo：Attack Chain manual verification next actions

## 需要人工补齐

- Verifier：真实验证人。
- VerifiedAt：真实 ISO-8601 验证时间，且不能是未来时间。
- Attack Chain A：人工验证 PASS 与真实证据。
- Attack Chain B：人工验证 PASS 与真实证据。
- Attack Chain C：人工验证 PASS 与真实证据。

## 命令模板

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
  -AttackChainCEvidence "<真实 C 链证据>" `
  -Notes "Automated support evidence PASS in _docs/_reports/attack-chain-automated-evidence-20260607.md."
```

## 后续

- 人工 Attack Chain PASS 后，才能准备 human security signoff。
- human security signoff 后，再重跑 release gate audit。
