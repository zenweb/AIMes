# 2026-05-31 Sprint 2 B4 Inventory 事务问题记录

## 已解决

- 问题：`MaterialRepository.UpdateAsync` 在 Inventory 事务边界内自行 `SaveChangesAsync`。
  - 影响：违反 CC plan / Eng Review 对 B4 的约束，事务提交点分散，后续容易回退成“仓储各自提交”的模式。
  - 证据：新增架构测试红灯，定位到 `MaterialRepository.cs:UpdateAsync`。
  - 处理：改为只调用 `_context.Materials.Update(material)`，由 `EfUnitOfWork` 统一保存。

- 问题：`StockTransactionRepository.AddAsync` 在 Inventory 事务边界内自行 `SaveChangesAsync`。
  - 影响：库存流水写入不应拥有独立提交点。
  - 处理：改为只调用 `_context.StockTransactions.Add(transaction)`，由 `EfUnitOfWork` 统一保存。

- 问题：缺少关系型测试证明 `StockOutAsync` 失败时不半提交。
  - 影响：InMemory 无法证明数据库事务语义。
  - 处理：新增 SQLite 测试，注入失败的库存流水仓储，验证物料扣减不落库且流水为 0。

## 过程中发现

- 并行执行 `dotnet test` 时可能锁住 `MES.Application.dll`。
  - 处理：串行重跑后通过；后续继续避免并行 .NET 测试。

- `InventoryAppService` 读取/写入物料时存在未传播 `CancellationToken` 的调用。
  - 处理：本轮已在库存服务内顺手补齐相关 CT 传播。

## 未解决

- Purchase 关键聚合的事务边界仍待审计。
- Sprint 3 的状态变更内联审计尚未展开，Inventory 出入库审计原子性需要在该阶段继续处理。
- OMX 外部代理审计仍不可用：缺 `C:\Users\陈奕铭\.codex\prompts`。
