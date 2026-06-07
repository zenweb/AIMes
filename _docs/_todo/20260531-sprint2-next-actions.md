# 2026-05-31 Sprint 2 下一步

## 已完成

- H13 Scheduling 数据库分页：已在前序变更完成并验证。
- H13 Equipment 数据库分页：已完成。
- H13 Admin 用户列表数据库分页：已完成。
- H13 架构门已覆盖 Scheduling/Equipment/Admin 及既有 Bom/Employee/Purchase。
- B4 Anomaly 创建事务边界：已完成，通知失败时异常与审计同回滚。
- B4 Inventory StockOut 事务边界：已完成，物料扣减与库存流水由 UoW 统一提交，流水写入失败时不半提交。
- B4 Purchase 关键聚合事务边界：已完成，Purchase 写服务与 Agent 采购执行路径由 UoW 统一提交。
- H1 AppService CancellationToken 传播：计划点名的 Scheduling/Quality/Equipment 已完成并加架构门。
- M5 领域实体 setter 可见性：计划点名的 Material/QualityInspection/SchedulePlan 已完成并加架构门。
- M7 并发令牌：计划点名的 WorkOrder/Equipment/Material/SchedulePlan 已完成并加架构门；Equipment 补 `xmin` 迁移。
- M8-M10 核心索引与 JSONB：工单/质检/库存流水核心复合索引已补，排产反馈 JSON 快照列已改 `jsonb` 并加架构门。

## 下一步

- 继续 Sprint 2：
  - B4：后续评估 Anomaly/Inventory 通知 Outbox 或提交后通知模式。
  - H1：可选扩展到其它 AppService 的全量 `CancellationToken` 传播审计。
  - Sprint 2 收尾：审计剩余非核心 JSON 字段与前序未跟踪迁移/快照漂移，决定是否单独整理。
- 分页卫生：
  - 评估 `RoutingAppService.GetAllRoutesAsync` 是否按 H13 同类模式改为仓储分页。
  - 评估是否抽出通用分页参数校验，覆盖 `PageQueryParameters` / `EquipmentQueryParameters` 及后续入口。
- 工具：
  - 如需真实 OMX agent 双 lane，先执行 `omx setup` 修复 `~/.codex/prompts` 缺失。
