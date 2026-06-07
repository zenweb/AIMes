# 2026-06-06 QualityCapaTaskPanel 复用草案转正式 CAPA 写入失败 Chromium 证据

## 变更

- 新增质量闭环 e2e：`质量知识复用转正式 CAPA 写入失败时真实浏览器展示 fail-loud 且不伪造正式 CAPA`。
- 用真实 Chromium 模拟 `aimes_quality_knowledge_reuse_closures` 写入失败。
- 验证失败时页面保留草案待复核状态，不显示正式 CAPA trace，不写入伪造闭环记录或 OTD 证据。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/quality.spec.ts -g "质量知识复用转正式 CAPA 写入失败"
```

结果：Nuxt production build passed，Chromium `1 passed`。
