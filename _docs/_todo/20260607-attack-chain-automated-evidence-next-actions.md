# Todo：Attack Chain 自动化辅助证据下一步

## 下一步

- 由人工 verifier 执行 Attack Chain A/B/C 手动验证。
- 为三条攻击链分别记录真实 evidence：
  - Attack Chain A：匿名/低权限访问与角色矩阵实测证据。
  - Attack Chain B：凭据、Token、日志、审计、前端状态或导出泄漏实测证据。
  - Attack Chain C：发布安全配置、CORS、依赖和漏洞包晋级控制实测证据。
- 使用 `scripts/run-attack-chain-verification.ps1` 生成非占位 PASS 报告。

## 人工验证命令模板

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

## 暂不继续

- 不用自动化 PASS 冒充人工安全签字。
- 不用 `TBD`、`PENDING`、`待补` 等占位 evidence 关闭 gate。
