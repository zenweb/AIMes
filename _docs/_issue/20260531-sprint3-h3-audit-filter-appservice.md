# 2026-05-31 Sprint 3 H3 Issue

## 已处理

- 问题：`AuditEndpointFilter` 直接依赖 `MesDbContext`、构造 `AuditLog` 并调用 `SaveChangesAsync`，破坏 API filter 到应用服务的分层边界。
  - 处理：改为调用 `IAuditLogAppService.WriteAuditLogAsync(...)`，并新增架构门禁止直接 EF 持久化回流。

## 待跟踪

- `AuditEndpointFilter` 仍通过请求作用域解析 `IAuditLogAppService`；若要完全满足构造注入约束，需要重构静态 filter/resource 注册模式。
- 审计写入仍由 `AuditLogRepository.AddAsync` 自提交，和业务写入之间没有统一 UoW；如后续要求审计与业务强原子，需要单独设计事务边界或 outbox。
