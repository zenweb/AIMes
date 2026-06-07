# 2026-06-07 Release Gate Latest Audit

## 变更

- 使用 2026-06-07 最新证据包运行 v1.0.0 B 轨硬发布门禁审计。
- 生成报告：`_docs/_reports/release-gate-audit-20260607-latest.md`。
- 本轮未修改产品代码，只补充发布门禁汇总审计证据。

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

结果：`FAIL`。

## 当前门禁状态

- Hosted CI：FAIL。
- PostgreSQL/staging：FAIL。
- Attack Chain A/B/C：FAIL。
- Security signoff：FAIL。
- Gray observation：FAIL。

该报告不能关闭 v1.0.0 release gate。
