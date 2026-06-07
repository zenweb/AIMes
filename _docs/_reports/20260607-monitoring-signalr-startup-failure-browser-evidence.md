# 2026-06-07 MonitoringBoard SignalR 启动失败真实浏览器证据

## 范围

- 目标：补齐 MonitoringBoard 在真实 Chromium 下的 SignalR 启动失败证据。
- 约束：不扩新功能，只硬化实时监控既有关键路径；保留后端不可用时的演示数据回落。

## 发现

- `MonitoringBoard` 原先把 `VITE_SHOW_DEMO_HINTS=true` 视为强制演示模式。
- e2e 环境默认开启 `VITE_SHOW_DEMO_HINTS=true`，即使测试显式写入 `aimes_offline_demo=false`，SignalR 也不会启动。
- 这会导致真实浏览器无法覆盖 `/hubs/monitoring/negotiate` 失败路径，只能停留在单元 mock 证据。

## 修复

- `MonitoringBoard` 的实时连接开关改为只由 `isOfflineDemoMode()` 控制。
- `VITE_SHOW_DEMO_HINTS` 继续用于演示提示，不再阻断真实 SignalR 启动。
- 新增单元测试证明：关闭离线演示时，即使 demo hints 开启，也会启动 SignalR。
- 新增 Chromium e2e：拦截 `/hubs/monitoring/negotiate` 返回 503，断言页面展示启动失败原因并回落设备演示数据。

## 验证

```powershell
npm.cmd run test:unit -- tests/unit/monitoring-board.test.ts -t "starts SignalR when offline demo is disabled"
npm.cmd run test:e2e -- tests/e2e/monitoring.spec.ts -g "SignalR 启动失败"
```

结果：Vitest 定向用例通过；Nuxt production build passed；Chromium `1 passed`。

## 未关闭项

- 本切片只补 A 轨真实浏览器证据。
- B 轨发布闸门仍未关闭：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度、14 天 P0/P1=0。
