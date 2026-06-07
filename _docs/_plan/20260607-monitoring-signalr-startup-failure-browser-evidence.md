# 2026-06-07 Plan - MonitoringBoard SignalR 启动失败真实浏览器证据

## 成功标准

- 关闭离线演示后，MonitoringBoard 即使在 demo hints 环境也会启动 SignalR。
- Chromium 中拦截 SignalR negotiate 503 后，页面展示失败原因。
- 失败后仍回落设备演示数据，避免实时监控首屏空白。

## 执行

1. 写单元红灯测试，证明 demo hints 曾阻断 SignalR。
2. 最小修复 MonitoringBoard 的演示模式判定。
3. 新增 Chromium e2e，mock 初始化治理接口成功空结果，只让 SignalR negotiate 失败。
4. 跑定向单元测试和 e2e。

## 非目标

- 不引入新的 SignalR mock 框架。
- 不改 Dashboard 的 SignalR 行为。
- 不关闭 B 轨发布闸门。
