# 2026-05-31 Sprint 4 H14 Metrics Subscriber Gate Changelog

## 变更

- 新增 `IMonitoringSubscriberTracker` / `MonitoringSubscriberTracker`，记录 `/hubs/monitoring` 当前连接数。
- `MonitoringHub` 在连接时递增订阅者计数，断开时递减并防止计数为负。
- `MetricsBackgroundService` 新增订阅者门控：
  - 无 monitoring 订阅者时不创建 DI scope，不解析 `IDashboardKpiService`，因此不查询数据库。
  - 有订阅者时才计算 KPI 并推送 `KpiUpdate` / `EquipmentMetrics`。
  - 空闲时使用指数退避等待，最多 60 秒。
- 新增 `MetricsBackgroundServiceTests`，覆盖无订阅者、有订阅者和计数器边界。

## 验证

- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore --filter "FullyQualifiedName~MetricsBackgroundServiceTests"`：通过，3/3。
