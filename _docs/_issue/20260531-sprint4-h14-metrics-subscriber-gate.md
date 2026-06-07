# 2026-05-31 Sprint 4 H14 Metrics Subscriber Gate Issue

## 背景

`MetricsBackgroundService` 原实现启动后每 5 秒创建 scope、解析 `IDashboardKpiService` 并计算 dashboard KPI，即使没有任何 SignalR monitoring 客户端连接，也会持续触发数据库查询。

## 处理

- 增加 monitoring 连接计数器。
- 无订阅者时后台服务直接跳过 KPI 计算。
- 空闲等待采用指数退避，降低无订阅者期间的循环开销。

## 遗留

- 尚未改成真正的领域事件驱动推送；目前仍是“有订阅者才周期推送”。
- 多实例连接状态未外部化，后续 Redis backplane/外部状态需要单独设计。
