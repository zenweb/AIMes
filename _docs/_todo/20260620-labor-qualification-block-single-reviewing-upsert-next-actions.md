# 2026-06-20 Todo - 人员停工复核后续

## 已完成
- 复核按钮单次写入 `reviewing`。
- 历史重复 `LaborQualificationBlock` 已通过 API upsert 收敛。
- 真实浏览器确认员工页无 Offline demo 降级，复核 POST 数量为 1。

## 后续
- 单独归因 SignalR negotiate 在页面跳转期间出现的 `net::ERR_ABORTED` 噪声，确认是否需要在连接生命周期中静默取消或延迟重连。
- 继续沿人员管理精品化链路检查“补证改派并重新放行”是否同样具备单次写入、读回一致、跨模块链接和审计证据。
