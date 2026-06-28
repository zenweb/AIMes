# 2026-06-12 Issue：排产拖拽保存缺少后端持久化级证据

## 问题

前端真实 dhtmlx E2E 已能证明拖拽会发出 reschedule PATCH，并显示正式排产计划已更新；但此前缺少后端级证据证明 PATCH 后数据库和 GET 读模型都能读到新窗口。

## 影响

- 发布审计只能看到浏览器请求和前端状态，不能完整说明“拖拽保存”已经跨过后端持久化边界。
- 若未来 repository 或映射层退化，前端 E2E 可能仍被 mock 掩盖。

## 处理

- 新增 `RescheduleItem_WhenSaved_ShouldPersistDraggedWindowToDatabaseAndPlanReadModel` 集成测试。
- 验证数据库中的 `ScheduleItem.PlannedStartTime/PlannedEndTime` 与 GET plan read model 均为拖拽后的时间窗口。

## 状态

已补证据并通过定向验证。生产代码无需修改。
