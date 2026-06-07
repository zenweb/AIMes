# 2026-06-07 MonitoringBoard SignalR 启动失败证据 Review

## 结论

- 本切片聚焦既有实时监控路径，没有新增业务能力。
- 真实 Chromium 已覆盖 SignalR negotiate 503 后的 fail-loud 文案与演示数据回落。

## 风险

- e2e 用例通过 route mock 触发 negotiate 失败，验证的是浏览器 UI 行为，不等价于真实 SignalR 服务端故障演练。
- 工作区存在大量既有脏改动，本 review 只覆盖本切片相关文件。

## 建议

- 下一片可继续补 Monitoring SignalR `onclose` / `onreconnecting` 的真实浏览器证据，但要先确认是否能稳定注入真实客户端事件。
- B 轨发布闸门需要单独追踪，不能用 A 轨浏览器证据替代。
