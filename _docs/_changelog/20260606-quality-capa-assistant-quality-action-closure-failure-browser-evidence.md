# 2026-06-06 QualityCapaTaskPanel 助手质量责任闭环失败 Chromium 证据

## 变更

- 新增质量闭环 e2e：`助手执行包质量责任闭环失败时真实浏览器展示 fail-loud 且不伪造质量闭环`。
- 用真实 Chromium 模拟 `aimes_assistant_recovery_packages` 写入失败。
- 验证失败时页面保留可重试按钮，不显示质量闭环结果、闭环审计号、闭环 trace，不写入伪造 closed 记录或 OTD 证据。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/quality.spec.ts -g "助手执行包质量责任闭环失败"
```

结果：Nuxt production build passed，Chromium `1 passed`。
