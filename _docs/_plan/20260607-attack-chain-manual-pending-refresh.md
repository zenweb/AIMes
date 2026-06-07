# Plan：Attack Chain manual pending refresh

## 成功标准

- 生成 2026-06-07 人工验证待补包。
- 待补包必须保持 PENDING / FAIL，不能伪造人工 PASS。
- 最新 release gate audit 引用 2026-06-07 待补包。
- 文档明确剩余人工动作。

## 执行

1. 读取 `scripts/run-attack-chain-verification.ps1` 参数和判定逻辑。
2. 读取 2026-06-07 自动化支持证据。
3. 运行人工验证脚本生成 pending report。
4. 用 pending report 重跑 release gate audit。
5. 记录 changelog、review、todo、issue、plan。

## 验证

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/run-attack-chain-verification.ps1 `
  -ReportPath _docs/_reports/attack-chain-verification-20260607-manual-pending.md `
  -Notes "Automated support evidence PASS in _docs/_reports/attack-chain-automated-evidence-20260607.md; manual verifier, VerifiedAt, and A/B/C evidence still required."
```

结果：`FAIL`，符合 fail-loud 预期。
