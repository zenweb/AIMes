# 2026-06-05 RoutingAppService Paging Next Actions

## 已完成

- `RoutingAppService.GetAllRoutesAsync()` 改为仓储分页 + 计数。
- `IRoutingRepository` 新增 `GetPagedAsync` / `CountAsync`。
- `RoutingRepository` 采用 `AsNoTracking()` + `OrderBy(RouteCode).ThenBy(Id)` + `Skip/Take`。
- 单测、架构测试和集成测试已验证通过。

## 后续

- 若后续继续扩面，可按同一分页标准检查其它仍存在服务层内存分页的列表接口。

