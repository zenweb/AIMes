# 2026-05-31 Sprint 2 B4 Inventory 事务审计

## 审计范围

- `EfUnitOfWork`
- `InventoryAppService`
- `MaterialRepository.UpdateAsync`
- `StockTransactionRepository.AddAsync`
- Inventory 事务架构门与 SQLite 关系型集成测试

不纳入本轮结论：Purchase 事务边界、Sprint 3 审计分层、前端和 AI 相关脏工作树改动。

## 结论

- Code review 本地结论：APPROVE。
- Architecture 本地结论：CLEAR。
- 最终建议：APPROVE for B4 Inventory StockOut transaction slice。

## 检查点

- `StockOutAsync` 已位于 `IUnitOfWork.ExecuteAsync` 内，物料扣减和库存流水写入共享同一个 `MesDbContext`。
- `MaterialRepository.UpdateAsync` 与 `StockTransactionRepository.AddAsync` 不再在 Inventory 事务边界内自行提交。
- `EfUnitOfWork` 对关系型 provider 执行：开始事务 -> action -> `SaveChangesAsync` -> commit。
- SQLite 失败测试证明库存流水写入失败时，物料扣减和流水都不持久化。
- Inventory 读取/写入路径补齐关键 `CancellationToken` 传播。
- 完整架构测试通过，并新增防回退规则覆盖 Inventory B4 约束。

## 工具限制

- `oh-my-codex:code-review` 要求 code-reviewer / architect 双 lane。
- 当前环境仍缺 `C:\Users\陈奕铭\.codex\prompts`，前序已验证 `omx ask` 不可用。
- 本轮没有伪造外部 agent 审计结论，采用本地 code-review / architecture 双视角，并记录该限制。

## 遗留风险

- `AnomalyRepository` 等非 Inventory 仓储仍在方法内调用 `SaveChangesAsync`；本轮只按计划约束改 Inventory 关键聚合，未做全仓储 UoW 改造。
- `StockInAsync`、`TransferAsync`、`AdjustAsync` 也受益于同一 UoW 保存模式，但本轮失败回归测试聚焦计划列明的 `StockOutAsync`。
- `InventoryEndpoints` 的通知仍在应用服务返回后发送，不属于本次数据库事务；后续 Sprint 3 审计分层/通知 Outbox 评估时应统一处理。
