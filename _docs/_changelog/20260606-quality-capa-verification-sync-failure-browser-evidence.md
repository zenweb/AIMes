# 2026-06-06 QualityCapaTaskPanel CAPA 验证同步失败 Chromium 证据

## 变更

- 新增质量闭环 e2e：`CAPA 验证同步失败时真实浏览器展示 fail-loud 且不伪造验证留痕`。
- 用真实 Chromium 模拟 `aimes_quality_capa_closure` 写入失败。
- 验证失败时页面保留任务执行中和可重试按钮，不显示已验证状态、验证 trace，不写入伪造 CAPA closure 或 OTD 证据。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/quality.spec.ts -g "CAPA 验证同步失败"
```

结果：Nuxt production build passed，Chromium `1 passed`。
