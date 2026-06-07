# 2026-06-07 MonitoringBoard SignalR 启动失败证据 Next Actions

## 下一步

- 继续按覆盖率杠杆选择用户必经、低真实浏览器证据的路径。
- 若继续 Monitoring，优先评估 SignalR `onclose` / `onreconnecting` 是否能在 Chromium 中稳定触发。
- 将发布阻断项保持在 B 轨单独追踪：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度、14 天 P0/P1=0。

## 停止条件

- 如果真实浏览器无法稳定触发 SignalR close/reconnecting，不继续乱试，改为记录阻塞并请求环境或测试注入方案。
