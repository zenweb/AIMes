# 生产实时监控看板

## 变更内容

### 后端
- `MonitoringHub.cs` — SignalR hub `/hubs/monitoring`，连接时自动加入 `monitoring` group
- `MetricsBackgroundService.cs` — BackgroundService，每 5 秒从数据库读取设备并推送 EquipmentMetrics + KpiUpdate
- `Program.cs` — 注册 MonitoringHub 端点 `/hubs/monitoring`

### 前端
- `MonitoringBoard.vue` — 完整监控看板组件：SignalR 连接管理、KPI 行（综合利用率/运行设备/今日产量/异常告警）、设备状态网格（负载条/温度/转速）、实时事件时间线、演示数据回退
- `router/index.ts` — 添加 `/monitoring` 路由（动态导入）
- `MainLayout.vue` — 导航栏添加"实时监控"链接

### 验证
- `vite build` 通过

## 待办
- 后端 MetricsBackgroundService 目前使用随机模拟数据，需接入真实数据源
