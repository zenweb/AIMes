# 2026-05-31 Sprint 2 H13 分页问题记录

## 已解决

- 问题：`EquipmentAppService.GetEquipmentsAsync` 拉全量设备，在应用层过滤状态并 `Skip/Take`。
  - 影响：设备列表数据量增长时内存压力增大，且 H13 “数据库分页”验收不成立。
  - 处理：新增设备仓储 `GetPagedAsync/CountAsync`，服务层改为仓储分页。

- 问题：`AdminAppService.GetAllUsersAsync` 拉全量用户并在应用层分页。
  - 影响：用户列表分页不受数据库限制，架构门无法防止回退。
  - 处理：新增用户仓储 `GetPagedAsync/CountAsync`，服务层改为仓储分页。

- 问题：非法分页参数未被拒绝。
  - 影响：`pageSize=0` 可能导致 `PagedResult.TotalPages` 除零，`page=0` 会形成无效分页语义。
  - 处理：Admin/Equipment 应用服务边界新增 `ValidatePaging`，测试确认非法参数不会进入仓储。

## 过程中发现

- SQLite 仓储集成测试若未设置 `AIMES_DATABASE_PROVIDER=SqlServer`，会按 PostgreSQL 并发列配置建表，触发 `materials.xmin` 约束问题。
  - 处理：新增 `PagingRepositoryTests` 采用既有 `WorkOrderRepositoryTests` / `ScheduleRepositoryTests` 模式，测试内临时设置 provider 并在 `finally` 恢复。

## 未解决

- OMX 外部代理审计暂不可用：本机缺 `C:\Users\陈奕铭\.codex\prompts`。
- `RoutingAppService.GetAllRoutesAsync` 仍是服务层分页，需后续确认是否纳入 H13 同类整改。
