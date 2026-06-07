# 2026-06-06 QualityCapaTaskPanel 发布推荐采纳失败 Chromium 证据

## 变更

- 新增质量闭环 e2e：`发布推荐采纳写入失败时真实浏览器展示 fail-loud 且不伪造采纳反馈`。
- 用真实 Chromium 模拟已发布推荐采纳时 `aimes_quality_knowledge_recommendation_feedback` 写入失败。
- 验证失败时页面保留可重试按钮，不显示采纳反馈、已采纳状态、下一轮训练集 trace，不写入伪造反馈或 OTD 证据。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/quality.spec.ts -g "发布推荐采纳写入失败"
```

结果：Nuxt production build passed，Chromium `1 passed`。
