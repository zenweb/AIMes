# 2026-06-07 Todo - 根因分析加载失败 Chromium 证据后续

## 下一步

- 可继续按覆盖率杠杆转向其他低覆盖且用户必经组件，避免在 QualityBoard 已覆盖路径继续榨干。
- 继续保留“先精品化既有功能，再扩新功能”的约束。
- 在外部环境状态变化后单独推进 B 轨：Hosted CI、PostgreSQL/staging、Attack Chain A/B/C 人工验证、安全签字、首次灰度、14 天 P0/P1=0。

## 暂不做

- 不扩展新功能。
- 不把本轮 A 轨 Chromium 绿灯当作发布闸门完成证据。
