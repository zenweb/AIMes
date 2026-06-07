# 2026-05-31 Sprint 3 H7 Issue

## 已处理

- 问题：Admin/Bom/Inventory/Purchase/Employee/Routing 多个写端点只有 validation，没有 endpoint-layer audit。
  - 处理：补 `AuditEndpointFilter` 并新增架构门。

## 待跟踪

- H3：`AuditEndpointFilter` 仍直接操作 `MesDbContext`，需改为通过应用服务写审计。
- H8：敏感字段脱敏需要单独验证，包括 password/token/secret 等字段。
- 失败审计：当前过滤器只在 handler 成功返回后写日志，如需记录失败操作需单独设计。
