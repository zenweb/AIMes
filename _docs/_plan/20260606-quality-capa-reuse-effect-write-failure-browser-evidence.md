# Plan: QualityCapaTaskPanel 复用效果验证写入失败浏览器证据

## 成功标准

- 真实 Chromium 中能渲染已批准正式 CAPA。
- 复用效果验证回写失败时页面显示 fail-loud alert。
- 失败后正式 CAPA 保持待验证，可重试。
- 失败后不显示复用效果 trace 或成功消息。
- 失败后不写入 verified 闭环记录或 OTD 证据。
- 目标 e2e 通过。

## 执行

- 选片：`QualityCapaTaskPanel.vue` 低于全局覆盖率，且质量 CAPA 复用效果验证是用户关键闭环。
- 范围：只补真实浏览器证据，不改生产逻辑。
- 实现：在 `quality.spec.ts` 预置样本、草案和 approved 正式 CAPA，注入 `aimes_quality_knowledge_reuse_closures` 验证回写失败，并断言 fail-loud 与无伪造证据。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/quality.spec.ts -g "质量知识复用效果验证写入失败"
```

结果：Nuxt production build passed，Chromium `1 passed`。
