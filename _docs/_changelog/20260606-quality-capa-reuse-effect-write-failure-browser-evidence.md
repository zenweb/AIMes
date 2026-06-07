# 2026-06-06 QualityCapaTaskPanel 复用效果验证写入失败 Chromium 证据

## 变更

- 新增质量闭环 e2e：`质量知识复用效果验证写入失败时真实浏览器展示 fail-loud 且不伪造效果回写`。
- 用真实 Chromium 模拟已批准正式 CAPA 在验证回写时 `aimes_quality_knowledge_reuse_closures` 写入失败。
- 验证失败时页面保留待验证状态，不显示复用效果 trace，不写入伪造 verified 闭环或 OTD 证据。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/quality.spec.ts -g "质量知识复用效果验证写入失败"
```

结果：Nuxt production build passed，Chromium `1 passed`。
