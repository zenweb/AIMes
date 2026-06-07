# Plan: QualityCapaTaskPanel 低分复核队列生成失败浏览器证据

## 成功标准

- 真实 Chromium 中能渲染低分复用候选。
- 复核队列生成失败时页面显示 fail-loud alert。
- 失败后生成按钮保持可见，可重试。
- 失败后不显示低分复核 trace 或成功消息。
- 失败后不写入复核队列记录或 OTD 证据。
- 目标 e2e 通过。

## 执行

- 选片：`QualityCapaTaskPanel.vue` 低于全局覆盖率，且低分复核队列是质量知识推荐可信度护栏。
- 范围：只补真实浏览器证据，不改生产逻辑。
- 实现：在 `quality.spec.ts` 预置样本、草案和已验证正式 CAPA，注入 `aimes_quality_knowledge_review_queue` 写入失败，并断言 fail-loud 与无伪造证据。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/quality.spec.ts -g "低分样本复核队列生成失败"
```

结果：Nuxt production build passed，Chromium `1 passed`。
