# P3.1 SignalR 推送扩展 - 前端

## 后端（上一会话完成）
- `INotificationService` + `NotificationService` 新增 `NotifyInventoryChanged`、`NotifyPurchaseOrderStatusChanged`
- `InventoryController` 注入 INotificationService，StockIn/Out/Transfer/Adjust 后推送
- `PurchaseController` 注入 INotificationService，Submit/Confirm/Receive/Cancel 后推送

## 前端（本次完成）
- `notifications.ts` 新增 `InventoryChanged` 事件处理，显示入库/出库/调拨/调整 toast
- `notifications.ts` 新增 `PurchaseOrderStatusChanged` 事件处理，显示采购单状态变更 toast

## 验证
- 后端编译: 0 错误
- 前端类型检查: 通过
- 单元测试: 152/152 通过
- 集成测试: 45/45 通过
