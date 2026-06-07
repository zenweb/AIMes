# 2026-05-31 Sprint 3 审计事务分层 Issue

## 已处理问题

- Purchase submit/confirm/cancel 仅依赖 endpoint filter 事务外审计，业务回滚与审计提交语义不一致。
- Inventory 出入库/调拨/盘点仅依赖 endpoint filter 事务外审计，无法满足“业务-审计原子性”。
- `AuditLogRepository.AddAsync` 自提交，导致即便服务层在 UoW 内调用审计，也可能提前提交。

## 剩余限制

- 内联审计 actor 仍需由业务请求字段承载；若后续要严格记录登录主体，需要在应用层引入显式 actor 参数或上下文接口。
