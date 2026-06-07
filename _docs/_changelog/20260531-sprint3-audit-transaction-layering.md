# 2026-05-31 Sprint 3 审计事务分层验收

## 变更

- Purchase 状态变更在业务 UoW 内写内联审计：
  - `PurchaseSubmit`
  - `PurchaseConfirm`
  - `PurchaseCancel`
- Inventory 库存状态变更在业务 UoW 内写内联审计：
  - `InventoryStockIn`
  - `InventoryStockOut`
  - `InventoryTransfer`
  - `InventoryAdjust`
- `AuditLogRepository.AddAsync` 不再自调用 `SaveChangesAsync`，由外层 `IUnitOfWork` 统一提交，保证业务和内联审计同事务。
- `AuditEndpointFilter` 保留为事务外操作追踪，继续覆盖 Admin/Bom/Inventory/Purchase/Employee/Routing 写端点的通用审计记录。
- `MES.Api.csproj` 的前端静态文件复制目标只在 `wwwroot/scheduling` 存在时执行 `RemoveDir`，避免测试构建时因目录不存在失败。
- 新增架构门：
  - 状态变更类 Purchase/Inventory 方法必须在业务 UoW 内触发内联审计。
  - `AuditLogRepository.AddAsync` 禁止自提交。

## 验证

- 内联审计架构门先红：Purchase/Inventory 缺少 `IAuditLogAppService` 依赖。
- 修复后：定向架构门通过。
- 聚焦单元测试通过：Purchase/Inventory app service 20 项。
- 聚焦集成测试通过：Purchase/Inventory 事务集成 3 项，并验证审计记录随业务事务提交。
