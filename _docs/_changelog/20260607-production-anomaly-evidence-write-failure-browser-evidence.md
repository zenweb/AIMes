# 2026-06-07 ProductionBoard 异常证据写入失败 Chromium 证据

## 变更

- 新增生产执行 e2e：`异常证据写入失败时真实浏览器保留 fail-loud 告警且不伪造风险联动`。
- 用真实 Chromium 模拟异常上报证据写入 `aimes_production_anomaly_event` 时 localStorage 抛错。
- 验证页面 fail-loud，同时不伪造异常管理/OTD 风险联动证据。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/production.spec.ts -g "异常证据写入失败"
```

结果：Nuxt production build passed，Chromium `1 passed`。
