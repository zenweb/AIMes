# Plan：2026-06-07 Release Gate Latest Audit

## 成功标准

- 使用最新可用证据包运行 `scripts/run-release-gate-audit.ps1`。
- 生成 `_docs/_reports/release-gate-audit-20260607-latest.md`。
- 如实记录 PASS/FAIL，不用局部证据替代硬门禁。
- 若失败，明确列出剩余门禁。

## 执行

1. 读取 release gate audit 脚本判定逻辑。
2. 读取 2026-06-07 hosted CI、staging、安全自评和 Attack Chain 相关证据。
3. 使用最新路径运行 release gate audit。
4. 读取报告确认门禁状态。
5. 记录 changelog、review、todo、issue、plan。

## 验证

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/run-release-gate-audit.ps1 `
  -ReportPath _docs/_reports/release-gate-audit-20260607-latest.md `
  -HostedCiReportPath _docs/_reports/hosted-ci-github-actions-evidence-20260607.md `
  -StagingReportPath _docs/_reports/staging-rehearsal-20260607-recheck.md `
  -AttackChainReportPath _docs/_reports/attack-chain-verification-20260606-recheck.md `
  -SecuritySignoffPath _docs/_review/20260606-security-signoff.md `
  -GrayObservationReportPath _docs/_reports/gray-observation-20260606.md
```

结果：`FAIL`，符合 fail-loud 预期。
