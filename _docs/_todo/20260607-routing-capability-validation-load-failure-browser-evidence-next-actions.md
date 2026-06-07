# 2026-06-07 Todo - RoutingBoard 能力校验记录加载失败 Chromium 证据后续

## 下一步

- 可继续按覆盖率杠杆评估下一个低覆盖且用户必经组件，避免继续榨已覆盖充分的路径。
- 若继续 Routing 域，优先只选仍缺真实浏览器证据、且和用户关键路径直接相关的 fail-loud 分支。
- 在外部环境状态变化后单独推进 B 轨：Hosted CI、PostgreSQL/staging、Attack Chain A/B/C 人工验证、安全签字、首次灰度、14 天 P0/P1=0。

## 暂不做

- 不扩展新功能。
- 不把本轮 A 轨 Chromium 绿灯当作发布闸门完成证据。
- 不把所有 backend-first helper 一刀切改成抛错，避免破坏既有 best-effort 回退页面。
