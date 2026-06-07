# Plan：Attack Chain 自动化辅助证据复核

## 成功标准

- 自动化辅助证据脚本生成当天报告。
- Endpoint authorization 测试通过。
- Agent role matrix 测试通过。
- Credential/token leakage controls 测试通过。
- Release security configuration gates 测试通过。
- 文档明确该报告不能替代人工验证。

## 执行

1. 读取 Attack Chain 与 security self-assessment 脚本。
2. 运行 `run-attack-chain-automated-evidence.ps1`。
3. 首次因缺 NuGet assets 失败后，执行 `dotnet restore src/backend/AIMes.slnx`。
4. 复跑自动化辅助证据脚本。
5. 记录报告、changelog、review、todo、issue。

## 验证

```powershell
dotnet restore src/backend/AIMes.slnx
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/run-attack-chain-automated-evidence.ps1 -ReportPath _docs/_reports/attack-chain-automated-evidence-20260607.md
```

结果：`PASS`。

## 边界

人工 Attack Chain A/B/C verifier、VerifiedAt、真实 evidence 和安全签字仍未关闭。
