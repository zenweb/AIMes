# 2026-06-07 QualityBoard 根因分析加载失败 Chromium 证据

## 变更

- 新增质量闭环 e2e：`根因分析加载失败时真实浏览器展示 fail-loud 且保留 fallback 分析`。
- 用真实 Chromium 模拟根因分析 API 返回 503。
- 验证页面 fail-loud，同时保留本地 fallback 根因分析 dialog。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/quality.spec.ts -g "根因分析加载失败"
```

结果：Nuxt production build passed，Chromium `1 passed`。
