# 2026-05-31 Sprint 2 B4 Anomaly 事务审计

## 审计范围

- `AnomalyEndpoints.CreateAsync`
- `AnomalyTransactionTests`
- 与 B4 相关的异常创建、审计写入、通知失败回滚路径

不纳入本轮结论：Inventory/Purchase 的事务边界、H13 分页、前端与 AI 相关脏工作树改动。

## 结论

- Code review 本地结论：COMMENT。
- Architecture 本地结论：WATCH。
- 最终建议：COMMENT for B4 Anomaly transaction slice。

当前切片满足计划里的核心回归：通知失败时异常与审计不会持久化。仍需在后续 B4/审计分层工作中处理外部通知副作用的长期模式。

## 检查点

- 异常创建、审计写入、通知推送处于同一 `IUnitOfWork.ExecuteAsync` 逻辑块。
- 关系型 SQLite 测试证明失败路径会回滚数据库状态。
- `CancellationToken` 已从端点传入 UoW，并在异常创建/审计写入中使用 `innerCt`。
- 未新增 null-forgiving。
- 架构测试保持通过。

## Watch

- 通知是外部 SignalR 副作用，不是真正可回滚的数据库状态。当前实现能覆盖“通知失败则数据库回滚”，但若通知成功后事务提交失败，客户端可能已收到未提交事实。
- 更完整的生产级方案应考虑事务内写 Outbox，提交后异步发布通知。本轮按计划 B4 的最小验收推进，Outbox 作为后续架构改进候选。
- `IUnitOfWork` action 可能被 EF execution strategy 重试；包含外部通知的 action 不是严格幂等。当前测试覆盖失败回滚，不覆盖瞬时故障重试下的重复通知。

## 工具限制

- 尝试使用 OMX `code-reviewer`：
  - 失败：`prompts directory not found: C:\Users\陈奕铭\.codex\prompts. Run "omx setup" to install prompts.`
- 没有伪造外部 agent 审计结论。
