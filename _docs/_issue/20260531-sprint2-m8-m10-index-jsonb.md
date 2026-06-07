# 2026-05-31 Sprint 2 M8-M10 问题记录

## 已解决

- 问题：工单列表多条件过滤缺少匹配复合索引。
  - 影响：按状态、车间、产品、计划时间过滤并分页时容易退化为低效扫描。
  - 处理：补 `Status + WorkshopId + ProductCode + PlannedStartDate + PlannedEndDate` 复合索引。

- 问题：车间工单查询按优先级和计划开始时间排序缺少匹配复合索引。
  - 影响：排产/车间视图查询可能产生额外排序成本。
  - 处理：补 `WorkshopId + Priority + PlannedStartDate` 复合索引。

- 问题：质检按工单/产品查询后按检验时间排序缺少复合索引。
  - 影响：质检历史查询和统计窗口读取效率不足。
  - 处理：补 `WorkOrderId + InspectedAt`、`ProductCode + InspectedAt` 复合索引。

- 问题：库存流水按物料查询并按创建时间倒序分页缺少复合索引。
  - 影响：单物料流水分页会依赖单列索引再排序。
  - 处理：补 `MaterialCode + CreatedAt` 复合索引。

- 问题：排产采纳反馈 JSON 快照列未显式使用 `jsonb`。
  - 影响：PostgreSQL 下无法利用 JSONB 类型能力，类型语义也不清晰。
  - 处理：将三个 JSON 快照列配置并迁移为 `jsonb`。

## 过程中发现

- 生成迁移容易把前序未跟踪模型快照漂移混入本轮，因此本轮采用手写迁移保持边界清晰。

## 未解决

- 真实历史数据的 JSON 合法性仍需在 staging 迁移前检查。
- Agent/Knowledge 等非本轮核心业务 JSON 字段仍未统一治理。
- 复合索引的最终收益仍需后续性能测试或慢查询采样验证。
