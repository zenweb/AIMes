# 2026-06-07 QualityBoard SPC 加载失败恢复 Chromium 证据

## 变更

- 新增质量闭环 e2e：`SPC 趋势分析加载失败后真实浏览器展示 fallback 并在后续成功时清理告警`。
- 用真实 Chromium 模拟 SPC API 首次 503、后续切换参数成功。
- 验证失败时展示 fallback 图点，恢复成功后清除 stale alert。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/quality.spec.ts -g "SPC 趋势分析加载失败"
```

结果：Nuxt production build passed，Chromium `1 passed`。
