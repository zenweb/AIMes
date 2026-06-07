# 2026-06-07 Todo - MonitoringBoard 初始化治理证据加载失败 Chromium 证据后续

## 下一步

- 可继续按覆盖率杠杆评估其他低覆盖且用户必经组件，优先风险、异常、审计、报表等发布证据链路径。
- 若继续 Monitoring 域，优先选择仍缺真实浏览器证据的 SignalR 断线/重连失败态，确保现场监控不会静默降级。
- 在外部环境状态变化后单独推进 B 轨：Hosted CI、PostgreSQL/staging、Attack Chain A/B/C 人工验证、安全签字、首次灰度、14 天 P0/P1=0。

## 暂不做

- 不扩展新功能。
- 不把本轮 A 轨 Chromium 绿灯当作发布闸门完成证据。
- 不把所有 backend-first helper 一刀切改成抛错，避免破坏既有 best-effort 回退页面。
