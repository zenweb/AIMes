# 2026-06-12 Review：排产拖拽保存后端持久化证据

## 审查结论

通过。`RescheduleItemAsync` 当前链路会加载计划、调用 `ScheduleItem.Reschedule`、再通过 `IScheduleRepository.UpdateAsync` 保存；新增集成测试证明数据库与 GET 读模型均返回拖拽后的时间窗口。

## 关键证据

- 测试不依赖 AI optimize，直接 seed 明确的计划和排产项，避免外部依赖造成证据薄弱。
- PATCH 成功后使用 `AsNoTracking()` + `Include(p => p.Items)` 从数据库重新读取，证明不是同一跟踪对象的内存假象。
- GET plan 再验一次读模型，覆盖前端后续刷新会读取到的 API 面。

## 风险

- 当前测试使用集成测试 InMemory provider，不等同于 PostgreSQL/staging 落库演练。
- PostgreSQL/staging 仍属于发布阻断轨道，需要单独证据闭环。

## 结论

本片补上排产拖拽保存的后端持久化证据，符合现有核心路径精品化要求。
