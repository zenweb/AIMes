# 2026-06-07 Attack Chain 自动化辅助证据复核

## 变更

- 运行 Attack Chain A/B/C 自动化辅助证据脚本：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/run-attack-chain-automated-evidence.ps1 -ReportPath _docs/_reports/attack-chain-automated-evidence-20260607.md
```

- 首次运行因 `project.assets.json` 缺失失败。
- 执行 `dotnet restore src/backend/AIMes.slnx` 后复跑通过。

## 结果

- 报告：`_docs/_reports/attack-chain-automated-evidence-20260607.md`
- Result: `PASS`
- Attack Chain A endpoint authorization：`5 passed`
- Attack Chain A agent role matrix：`37 passed`
- Attack Chain B credential/token leakage controls：`3 passed`
- Attack Chain C release security configuration gates：`4 passed`

## 边界

本报告只提供自动化辅助证据，不替代人工 Attack Chain A/B/C verifier、VerifiedAt、实测 evidence 和安全签字。
