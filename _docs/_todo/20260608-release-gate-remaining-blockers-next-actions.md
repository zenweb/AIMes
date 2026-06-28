# Todo：Release Gate 剩余阻断下一步

## 你需要做的最小人工动作

1. 按 `_docs/_reports/attack-chain-manual-verification-packet-20260607.md` 逐项验证 Attack Chain A/B/C。
2. 用真实 verifier、真实时间戳、真实证据运行：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/run-attack-chain-verification.ps1 `
  -ReportPath _docs/_reports/attack-chain-verification-20260608-manual-verified.md `
  -Verifier "<你的名字>" `
  -VerifiedAt "<ISO-8601 timestamp>" `
  -AttackChainA PASS `
  -AttackChainB PASS `
  -AttackChainC PASS `
  -AttackChainAEvidence "<A 的真实证据>" `
  -AttackChainBEvidence "<B 的真实证据>" `
  -AttackChainCEvidence "<C 的真实证据>" `
  -Notes "Automated support evidence: _docs/_reports/attack-chain-automated-evidence-20260607-current.md"
```

3. 人类 signer 更新 `_docs/_review/20260607-security-signoff.md`：
   - `Status: SIGNED`
   - `SignedAt: <真实时间>`
   - `Decision: SIGNED`
   - `Evidence: <真实签字依据>`
4. 启动 first gray release。
5. 灰度开始后记录 GrayReleaseId / GrayStartedAt / ObservationStartedAt。
6. 满 14 calendar days 且 P0/P1 = 0 后，再运行 `scripts/run-gray-observation.ps1` 生成 PASS 证据。

## 不要继续做

- 不要继续用自动化脚本反复跑 Attack Chain/gray/signoff 期待自动变 PASS。
- 不要把 staged 环境 PASS 误当成 release PASS。
