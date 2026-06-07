# 2026-06-07 MonitoringBoard SignalR 启动失败 Chromium 证据

## 变更

- 修正 MonitoringBoard 的演示模式判定：`VITE_SHOW_DEMO_HINTS` 不再阻断真实 SignalR 连接。
- 新增单元测试覆盖 demo hints 开启但离线演示关闭时仍启动 SignalR。
- 新增 Monitoring e2e：`SignalR 启动失败时真实浏览器展示失败原因并回落演示设备数据`。

## 验证

```powershell
npm.cmd run test:unit -- tests/unit/monitoring-board.test.ts -t "starts SignalR when offline demo is disabled"
npm.cmd run test:e2e -- tests/e2e/monitoring.spec.ts -g "SignalR 启动失败"
```

结果：Vitest 定向用例通过；Nuxt production build passed；Chromium `1 passed`。
