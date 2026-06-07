# 2026-06-07 QualityBoard 质量异常告警加载失败 Chromium 证据

## 变更

- 新增质量闭环 e2e：`质量异常告警加载失败时真实浏览器展示 fail-loud 且保留本地告警`。
- 用真实 Chromium 模拟 `/api/v1/anomaly` 返回 503。
- 验证页面 fail-loud，同时保留 3 条本地 fallback 异常告警，不显示空状态。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/quality.spec.ts -g "质量异常告警加载失败"
```

结果：Nuxt production build passed，Chromium `1 passed`。
