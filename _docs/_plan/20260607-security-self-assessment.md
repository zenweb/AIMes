# Plan：2026-06-07 本地安全自评

## 成功标准

- 运行 `scripts/run-security-self-assessment.ps1`。
- 生成 `_docs/_reports/security-self-assessment-20260607-local.md`。
- 单元安全测试、集成安全测试、架构安全门禁、NuGet 漏洞审计和 npm audit 全部通过。
- 文档明确标注人工 Attack Chain 和 human signoff 不由该脚本关闭。

## 执行

1. 读取安全自评脚本，确认检查范围。
2. 检查当天是否已有安全自评报告。
3. 运行本地安全自评。
4. 读取报告确认结果。
5. 记录 changelog、review、todo、issue、plan。

## 验证

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/run-security-self-assessment.ps1 -ReportPath _docs/_reports/security-self-assessment-20260607-local.md
```

结果：`PASS`。
