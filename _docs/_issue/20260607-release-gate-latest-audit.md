# Issue：v1.0.0 B 轨硬发布门禁仍未关闭

## 状态

`_docs/_reports/release-gate-audit-20260607-latest.md` 结果为 `FAIL`。

## 风险

如果继续只看 A 轨前端浏览器证据或本地安全自评，会产生“发布正在接近完成”的错觉；但 v1.0.0 的硬发布门禁仍卡在 hosted CI、PostgreSQL/staging、人工 Attack Chain、安全签字和灰度观察。

## 证据

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

## 当前失败项

- Hosted CI release gate is not PASS.
- PostgreSQL/staging release gate is not PASS.
- Attack Chain A/B/C release gate is not PASS.
- Security signoff release gate is not PASS.
- Gray observation release gate is not PASS.
