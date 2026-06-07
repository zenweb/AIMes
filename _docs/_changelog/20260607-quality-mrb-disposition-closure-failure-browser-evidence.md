# 2026-06-07 QualityBoard MRB 处置闭环写入失败 Chromium 证据

## 变更

- 新增质量闭环 e2e：`MRB 处置闭环写入失败时真实浏览器展示 fail-loud 且不伪造闭环结论`。
- 用真实 Chromium 模拟 `aimes_quality_mrb_disposition` 闭环写入失败。
- 验证失败时页面保持 active MRB 状态，不显示闭环成功消息、闭环审计号、闭环 trace，不写入伪造 closed 或 OTD 证据。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/quality.spec.ts -g "MRB 处置闭环写入失败"
```

结果：Nuxt production build passed，Chromium `1 passed`。
