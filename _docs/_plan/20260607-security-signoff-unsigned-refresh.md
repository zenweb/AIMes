# Plan：Security signoff unsigned refresh

## 成功标准

- 生成 2026-06-07 UNSIGNED security signoff packet。
- Packet 引用 2026-06-07 自动化安全自评和 Attack Chain 证据。
- Packet 明确人工 Attack Chain 仍 FAIL，不能签字。
- Release gate audit 引用 2026-06-07 signoff packet，并保持 FAIL。

## 执行

1. 读取 2026-06-06 security signoff 格式。
2. 读取 2026-06-07 security self-assessment PASS 报告。
3. 读取 2026-06-07 Attack Chain manual pending 报告。
4. 新增 `_docs/_review/20260607-security-signoff.md`。
5. 使用该 signoff 包重跑 release gate audit。

## 验证

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/run-release-gate-audit.ps1 `
  -ReportPath _docs/_reports/release-gate-audit-20260607-security-signoff-unsigned.md `
  -HostedCiReportPath _docs/_reports/hosted-ci-github-actions-evidence-20260607.md `
  -StagingReportPath _docs/_reports/staging-rehearsal-20260607-recheck.md `
  -AttackChainReportPath _docs/_reports/attack-chain-verification-20260607-manual-pending.md `
  -SecuritySignoffPath _docs/_review/20260607-security-signoff.md `
  -GrayObservationReportPath _docs/_reports/gray-observation-20260606.md
```

结果：`FAIL`，符合 fail-loud 预期。
