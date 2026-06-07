# 2026-06-07 Issue - MonitoringBoard SignalR 启动失败路径缺少 Chromium 证据

## 问题

MonitoringBoard 已有 SignalR 启动失败的单元测试，但真实 Chromium 无法稳定进入该路径。

## 根因

e2e 环境开启 `VITE_SHOW_DEMO_HINTS=true`，而 MonitoringBoard 曾把该变量当成强制演示模式，导致 SignalR 连接不会启动。

## 处理

- 将 MonitoringBoard 实时连接开关收敛为 `isOfflineDemoMode()`。
- 用单元测试锁住 demo hints 与离线演示的边界。
- 用 Chromium e2e 拦截 `/hubs/monitoring/negotiate` 503，证明页面展示失败原因并回落演示数据。

## 状态

已通过定向单元测试和真实 Chromium e2e。
