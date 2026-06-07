# 2026-06-07 Todo - BomBoard BOM 展开失败 Chromium 证据后续

## 下一步

- `BomBoard` 三个基础读取失败路径已具备真实 Chromium 证据：列表、详情、展开。
- 后续按覆盖率杠杆转向其他低覆盖且用户必经组件，优先库存、路由、审计、现场执行等发布证据链路径。
- 在外部环境状态变化后单独推进 B 轨：Hosted CI、PostgreSQL/staging、Attack Chain A/B/C 人工验证、安全签字、首次灰度、14 天 P0/P1=0。

## 暂不做

- 不扩展新功能。
- 不把本轮 A 轨 Chromium 绿灯当作发布闸门完成证据。
- 不重复跑 B 轨脚本，除非 CI、staging、Docker registry 或人工签字状态发生变化。
