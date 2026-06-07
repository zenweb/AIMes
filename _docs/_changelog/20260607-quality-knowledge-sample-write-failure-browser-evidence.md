# 2026-06-07 QualityBoard 质量知识样本写入失败 Chromium 证据

## 变更

- 新增质量闭环 e2e：`质量知识样本写入失败时真实浏览器展示 fail-loud 且不伪造样本入库`。
- 用真实 Chromium 模拟 `aimes_quality_knowledge_samples` 写入失败。
- 验证失败时页面保留可重试按钮，不显示样本入库审计号、trace、同步区域或成功消息。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/quality.spec.ts -g "质量知识样本写入失败"
```

结果：Nuxt production build passed，Chromium `1 passed`。
