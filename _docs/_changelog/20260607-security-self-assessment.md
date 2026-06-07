# 2026-06-07 Security Self-Assessment 本地安全自评

## 变更

- 运行 v1.0.0 发布门禁本地安全自评脚本。
- 生成报告：`_docs/_reports/security-self-assessment-20260607-local.md`。
- 本轮未修改产品代码或测试代码，只补充当天安全自评证据。

## 验证

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/run-security-self-assessment.ps1 -ReportPath _docs/_reports/security-self-assessment-20260607-local.md
```

结果：`PASS`。

通过项：

- MES.Tests.Unit security tests：50 passed。
- MES.Tests.Integration security tests：18 passed。
- MES.ArchitectureTests security gates：19 passed。
- NuGet vulnerability audit：当前源下无易受攻击包。
- npm audit：found 0 vulnerabilities。

## 边界

- 该脚本明确不自动化 Attack Chain A/B/C 人工验证。
- 该脚本不替代 human security signoff。
