# 2026-06-06 QualityCapaTaskPanel 低分复核队列生成失败 Chromium 证据

## 变更

- 新增质量闭环 e2e：`低分样本复核队列生成失败时真实浏览器展示 fail-loud 且不伪造复核队列`。
- 用真实 Chromium 模拟 `aimes_quality_knowledge_review_queue` 写入失败。
- 验证失败时页面保留生成按钮，不显示低分复核 trace，不写入伪造复核队列或 OTD 证据。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/quality.spec.ts -g "低分样本复核队列生成失败"
```

结果：Nuxt production build passed，Chromium `1 passed`。
