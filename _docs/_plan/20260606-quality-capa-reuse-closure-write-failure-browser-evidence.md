# Plan: QualityCapaTaskPanel 复用草案转正式 CAPA 写入失败浏览器证据

## 成功标准

- 真实 Chromium 中能渲染质量知识复用草案。
- 正式 CAPA 闭环写入失败时页面显示 fail-loud alert。
- 失败后草案保持待复核，可重试。
- 失败后不显示正式 CAPA trace 或成功消息。
- 失败后不写入闭环记录或 OTD 证据。
- 目标 e2e 通过。

## 执行

- 选片：`QualityCapaTaskPanel.vue` 低于全局覆盖率，且质量 CAPA 是用户关键闭环。
- 范围：只补真实浏览器证据，不改生产逻辑。
- 实现：在 `quality.spec.ts` 预置样本/草案，注入 `aimes_quality_knowledge_reuse_closures` 写入失败，并断言 fail-loud 与无伪造证据。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/quality.spec.ts -g "质量知识复用转正式 CAPA 写入失败"
```

结果：Nuxt production build passed，Chromium `1 passed`。
