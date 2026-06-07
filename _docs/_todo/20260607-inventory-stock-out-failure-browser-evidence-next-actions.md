# 2026-06-07 Todo - InventoryBoard 库存出库失败 Chromium 证据后续

## 下一步

- 可继续按覆盖率杠杆评估 `InventoryBoard` 的调拨或盘点失败真实浏览器证据。
- 若其他低覆盖且用户必经组件收益更高，优先转向现场执行、审计、路由、质量等发布证据链路径。
- 在外部环境状态变化后单独推进 B 轨：Hosted CI、PostgreSQL/staging、Attack Chain A/B/C 人工验证、安全签字、首次灰度、14 天 P0/P1=0。

## 暂不做

- 不扩展新功能。
- 不把本轮 A 轨 Chromium 绿灯当作发布闸门完成证据。
- 不重复跑 B 轨脚本，除非 CI、staging、Docker registry 或人工签字状态发生变化。
