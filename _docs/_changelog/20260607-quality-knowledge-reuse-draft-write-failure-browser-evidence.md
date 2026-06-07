# 2026-06-07 QualityBoard 质量知识复用草案写入失败 Chromium 证据

## 变更

- 新增质量闭环 e2e：`质量知识复用草案写入失败时真实浏览器展示 fail-loud 且不伪造草案证据`。
- 用真实 Chromium 先生成质量知识样本，再模拟 `aimes_quality_knowledge_reuse_drafts` 写入失败。
- 验证失败时页面保留可重试按钮，不显示草案审计号、trace、结果区域或成功消息。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/quality.spec.ts -g "质量知识复用草案写入失败"
```

结果：Nuxt production build passed，Chromium `1 passed`。
