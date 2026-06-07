# 2026-06-06 QualityCapaTaskPanel 低分复核队列关闭失败 Chromium 证据

## 变更

- 新增质量闭环 e2e：`低分样本复核队列关闭失败时真实浏览器展示 fail-loud 且不伪造关闭结论`。
- 用真实 Chromium 模拟 open 复核队列关闭时 `aimes_quality_knowledge_review_queue` 写入失败。
- 验证失败时页面保留 open 队列，不显示关闭结论 trace、再训练候选 trace，不写入伪造 closed 记录或 OTD 证据。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/quality.spec.ts -g "低分样本复核队列关闭失败"
```

结果：Nuxt production build passed，Chromium `1 passed`。
