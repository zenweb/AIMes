# 2026-05-31 Sprint 4 H14 Metrics Subscriber Gate Review

## 结论

- H14 的本地核心验收已满足：无 SignalR monitoring 订阅者时，`MetricsBackgroundService` 不创建 scope、不调用 `IDashboardKpiService`，从而不查询数据库。
- 有订阅者时仍会计算 KPI 并向 `monitoring` group 推送 `KpiUpdate` 和 `EquipmentMetrics`。

## 风险

- 本轮实现的是订阅者检测 + 指数退避；“事件驱动”部分仍保留为后续增强，当前仍是有订阅者时按周期推送。
- 连接数是进程内计数；多副本部署时每个实例只知道本实例连接数。若 SignalR 横向扩展，需要 Redis backplane 或外部连接状态。

## 已验证

- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore --filter "FullyQualifiedName~MetricsBackgroundServiceTests"`
