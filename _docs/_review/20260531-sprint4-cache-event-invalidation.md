# 2026-05-31 Sprint 4 Cache Event Invalidation Review

## 结论

- 本地审计通过：4.6 的核心本地要求已落地，报工/排产计划相关事件会让排产上下文 full snapshot 失效。
- 本轮选择全局失效而非按 workshop 精确失效，因为现有 `OperationReportedIntegrationEvent` 与 `SchedulePlanCreatedIntegrationEvent` 不携带 `WorkshopId`；猜测 workshop 会导致删错 key。

## 覆盖点

- full snapshot 读写统一经过 `ISchedulingContextCache`。
- domain event handler 与 integration consumer 都调用同一个共享 cache 的 `InvalidateAll()`。
- 单元测试覆盖 token 失效行为；架构测试覆盖注册、provider 使用和 consumer 使用。

## 剩余风险

- 全局失效比按 workshop 失效更保守，事件频繁时会增加下一次上下文重建成本。
- 若后续事件 DTO 增加 `WorkshopId`，可改为精确失效对应 workshop 的 full snapshot。
