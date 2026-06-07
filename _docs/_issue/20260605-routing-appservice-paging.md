# 2026-06-05 RoutingAppService Paging Issue

## 问题

- `RoutingAppService.GetAllRoutesAsync()` 仍使用 `_routingRepo.GetAllAsync()` 拉全量后在应用层 `Skip/Take`。
- 这会让路线列表分页失去仓储级控制，和 `Admin` / `Equipment` / `WorkOrder` 的分页收口标准不一致。

## 处理目标

- 路线列表改为仓储分页与计数。
- 服务层在进入仓储前校验 `page/pageSize`。
- 用单测、架构测试和 SQLite 关系型 SQL 日志测试锁定行为。

