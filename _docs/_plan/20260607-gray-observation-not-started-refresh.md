# Plan：Gray observation not-started refresh

## 成功标准

- 生成 2026-06-07 gray observation `NOT_STARTED` 报告。
- 报告保持 FAIL，不伪造灰度或 14 天观察。
- 最新 release gate audit 引用 2026-06-07 五个 B 轨证据包。
- 文档明确剩余灰度动作。

## 执行

1. 读取 `scripts/run-gray-observation.ps1` 判定逻辑。
2. 读取 2026-06-06 gray observation 旧包。
3. 运行 gray observation 脚本生成 2026-06-07 not-started 报告。
4. 使用五个 2026-06-07 B 轨证据包重跑 release gate audit。
5. 记录 changelog、review、todo、issue、plan。

## 验证

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/run-gray-observation.ps1 `
  -ReportPath _docs/_reports/gray-observation-20260607-not-started.md `
  -Status NOT_STARTED
```

结果：`FAIL`，符合 fail-loud 预期。
