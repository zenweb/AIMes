# 2026-05-31 Sprint 4 Cache Event Invalidation Issue

## 已处理

- 问题：`SchedulingContextProvider.HandleOperationReportedAsync` 和 `HandleSchedulePlanCreatedAsync` 只记录日志，没有让 cached full snapshot 失效。
  - 处理：新增共享 `SchedulingContextCache`，事件处理后调用 `InvalidateAll()`。
- 问题：integration consumers 使用 `WorkOrderNumber` 或 `PlanId` 作为 `workshopId` 调 `UpdateCacheAsync`，会删除错误的 `scheduling-context:{workshop}:full` key。
  - 处理：consumer 保留事件快照写入，同时通过共享 cache 全局失效 full snapshot，避免继续读旧上下文。

## 未关闭的外部验证

- 需要在 staging 或集成环境实际触发报工/排产计划创建，观察下一次排产上下文重新查库。
- 若生产事件量较大，需要观测全局失效导致的上下文重建频率。
