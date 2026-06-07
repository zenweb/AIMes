# 2026-06-06 QualityBoard MRB 处置证据写入失败 Chromium 证据

## 变更

- 新增质量闭环 e2e：`MRB 处置证据写入失败时真实浏览器展示 fail-loud 且不伪造 MRB 决策`。
- 用真实 Chromium 模拟 `aimes_quality_mrb_disposition` 写入失败。
- 验证失败时页面保持 `待 MRB 判定`，不显示成功消息或闭环按钮，不写入伪造 MRB 决策或 OTD 证据。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/quality.spec.ts -g "MRB 处置证据写入失败"
```

结果：Nuxt production build passed，Chromium `1 passed`。
