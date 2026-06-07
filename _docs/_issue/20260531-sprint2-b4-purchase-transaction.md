# 2026-05-31 Sprint 2 B4 Purchase 事务问题记录

## 已解决

- 问题：`PurchaseAppService` 写路径未使用 `IUnitOfWork`。
  - 影响：Purchase 关键聚合不满足 B4 统一事务边界要求。
  - 证据：新增架构测试红灯，提示 `PurchaseAppService` 未使用 UoW。
  - 处理：五个写方法全部包入 `_unitOfWork.ExecuteAsync`。

- 问题：`PurchaseOrderRepository.AddAsync/UpdateAsync` 在仓储内部自行 `SaveChangesAsync`。
  - 影响：仓储拥有独立提交点，违反计划中“纳入事务的仓储不得各自提交”的约束。
  - 处理：改为只 Add/Update EF change tracker，由 UoW 统一保存。

- 问题：`ScheduleAgentService.ExecutePurchaseWriteAsync` 直接调用采购仓储更新。
  - 影响：仓储取消自提交后，该 Agent 写路径可能静默不保存。
  - 处理：采购执行写路径包入 `IUnitOfWork.ExecuteAsync`，并用 `innerCt` 传播。

## 过程中发现

- 架构测试首次实现只检查文件中是否出现 UoW，覆盖面偏弱。
  - 处理：收紧为逐个检查 `CreateAsync`、`SubmitAsync`、`ConfirmAsync`、`ReceiveAsync`、`CancelAsync` 方法体。

## 未解决

- Purchase 状态变更类端点的内联审计原子性仍属于 Sprint 3 审计分层。
- Purchase 通知失败/重复通知的长期方案仍需与 Anomaly/Inventory 统一评估 Outbox 或提交后通知。
- OMX 外部代理审计仍不可用：缺 `C:\Users\陈奕铭\.codex\prompts`。
